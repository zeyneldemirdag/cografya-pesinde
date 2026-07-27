"""Vectorize MEB's four-class Turkey vegetation-formations map."""

from __future__ import annotations

import io
import json
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt, label
from shapely.geometry import LineString, Polygon, mapping, shape
from shapely.ops import polygonize, unary_union
from skimage.measure import find_contours


ROOT = Path(__file__).resolve().parents[1]
PROVINCES_PATH = ROOT / "public" / "data" / "turkey-provinces.geojson"
OUTPUT_PATH = ROOT / "public" / "data" / "turkey-vegetation-distribution.geojson"
SOURCE_URL = (
    "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/"
    "cografya/10/unite1/bolum2/files/mobile/41.jpg"
)

WEST_LON = 26.0
EAST_LON = 44.8
NORTH_LAT = 42.1
SOUTH_LAT = 35.8
WEST_PIXEL = 128.0
EAST_PIXEL = 1125.0
NORTH_PIXEL = 458.0
SOUTH_PIXEL = 884.0

PALETTE = [
    ("forest-shrub-map", "Ormanlar ve Çeşitli Çalılar", (26, 175, 85)),
    ("redpine-shrub-map", "Kızılçam Ormanları ve Çalılar (Maki-Garig)", (248, 142, 128)),
    ("step-meadow-map", "Bozkır-Antropojen Bozkır-Çayır", (255, 248, 124)),
    ("alpine-meadow-map", "Alpin Çayırlar", (40, 65, 157)),
]


def pixel_to_geo(x: float, y: float) -> tuple[float, float]:
    lon = WEST_LON + (x - WEST_PIXEL) * (EAST_LON - WEST_LON) / (
        EAST_PIXEL - WEST_PIXEL
    )
    lat = NORTH_LAT - (y - NORTH_PIXEL) * (NORTH_LAT - SOUTH_LAT) / (
        SOUTH_PIXEL - NORTH_PIXEL
    )
    return lon, lat


def geo_to_pixel(lon: float, lat: float) -> tuple[float, float]:
    x = WEST_PIXEL + (lon - WEST_LON) * (EAST_PIXEL - WEST_PIXEL) / (
        EAST_LON - WEST_LON
    )
    y = NORTH_PIXEL + (NORTH_LAT - lat) * (SOUTH_PIXEL - NORTH_PIXEL) / (
        NORTH_LAT - SOUTH_LAT
    )
    return x, y


def draw_polygon_mask(
    draw: ImageDraw.ImageDraw, polygon: Polygon, fill: int
) -> None:
    draw.polygon(
        [geo_to_pixel(lon, lat) for lon, lat in polygon.exterior.coords],
        fill=fill,
    )
    for interior in polygon.interiors:
        draw.polygon(
            [geo_to_pixel(lon, lat) for lon, lat in interior.coords],
            fill=0,
        )


def country_mask(width: int, height: int, country) -> np.ndarray:
    image = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(image)
    polygons = [country] if country.geom_type == "Polygon" else list(country.geoms)
    for polygon in polygons:
        draw_polygon_mask(draw, polygon, 1)
    return np.asarray(image, dtype=bool)


def clean_components(mask: np.ndarray) -> np.ndarray:
    cleaned = mask.copy()
    components, count = label(mask)
    for component_id in range(1, count + 1):
        ys, xs = np.where(components == component_id)
        if len(xs) == 0:
            continue
        width = int(xs.max() - xs.min() + 1)
        height = int(ys.max() - ys.min() + 1)
        rectangularity = len(xs) / max(width * height, 1)
        is_noise = len(xs) < 20
        is_frame = (
            (width > 120 and height <= 2)
            or (height > 120 and width <= 2)
        )
        is_legend = (
            xs.min() > 790
            and ys.min() > 790
            and width < 65
            and height < 40
            and rectangularity > 0.65
        )
        if is_noise or is_frame or is_legend:
            cleaned[components == component_id] = False
    return cleaned


def mask_to_geometry(mask: np.ndarray, country):
    padded = np.pad(mask.astype(np.uint8), 1)
    lines = []
    for contour in find_contours(padded, 0.5):
        if len(contour) < 8:
            continue
        coordinates = [
            pixel_to_geo(float(col - 1), float(row - 1))
            for row, col in contour
        ]
        if coordinates[0] != coordinates[-1]:
            coordinates.append(coordinates[0])
        lines.append(LineString(coordinates))

    pieces = []
    for polygon in polygonize(unary_union(lines)):
        sample = polygon.representative_point()
        x, y = geo_to_pixel(sample.x, sample.y)
        row = int(round(y))
        col = int(round(x))
        if (
            0 <= row < mask.shape[0]
            and 0 <= col < mask.shape[1]
            and mask[row, col]
        ):
            pieces.append(polygon)

    return (
        unary_union(pieces)
        .intersection(country)
        .buffer(0)
        .simplify(0.01, preserve_topology=True)
    )


def main() -> None:
    request = urllib.request.Request(
        SOURCE_URL, headers={"User-Agent": "KPSS-Cografya-Pesinde/1.0"}
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        image = Image.open(io.BytesIO(response.read())).convert("RGB")
    pixels = np.asarray(image, dtype=np.int32)

    provinces = json.loads(PROVINCES_PATH.read_text(encoding="utf-8"))
    country = unary_union(
        [shape(feature["geometry"]).buffer(0) for feature in provinces["features"]]
    ).buffer(0)
    mask_country = country_mask(image.width, image.height, country)

    palette_rgb = np.asarray([item[2] for item in PALETTE], dtype=np.int32)
    distances = np.sum(
        (pixels[:, :, None, :] - palette_rgb[None, None, :, :]) ** 2,
        axis=3,
    )
    nearest_label = np.argmin(distances, axis=2)
    nearest_distance = np.min(distances, axis=2)
    known_labels = np.full((image.height, image.width), -1, dtype=np.int16)

    for palette_index in range(len(PALETTE)):
        raw_mask = (
            (nearest_label == palette_index)
            & (nearest_distance <= 32**2)
        )
        known_labels[clean_components(raw_mask)] = palette_index

    known = known_labels >= 0
    fill_distance, nearest_indices = distance_transform_edt(
        ~known, return_distances=True, return_indices=True
    )
    filled_labels = known_labels[nearest_indices[0], nearest_indices[1]]
    filled_labels[~mask_country] = -1
    filled_labels[fill_distance > 24] = -1

    features = []
    for palette_index, (feature_id, name, colour) in enumerate(PALETTE):
        geometry = mask_to_geometry(filled_labels == palette_index, country)
        if geometry.is_empty:
            raise RuntimeError(f"{name} geometry is empty")
        features.append(
            {
                "type": "Feature",
                "id": feature_id,
                "properties": {
                    "id": feature_id,
                    "name": name,
                    "source": "MEB",
                    "source_url": SOURCE_URL,
                    "source_rgb": list(colour),
                },
                "geometry": mapping(geometry),
            }
        )

    OUTPUT_PATH.write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "name": "MEB Türkiye Bitki Formasyonları",
                "source": SOURCE_URL,
                "features": features,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    print(f"Yazıldı: {OUTPUT_PATH} ({len(features)} bitki formasyonu)")


if __name__ == "__main__":
    main()
