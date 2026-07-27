"""Vectorize the official MEB Turkey soil-distribution map."""

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
OUTPUT_PATH = ROOT / "public" / "data" / "turkey-soil-distribution.geojson"
SOURCE_URL = (
    "https://ogmmateryal.eba.gov.tr/panel/upload/images/qmhc1q1kqvz.png"
)
MEB_SOIL_TEXT_URL = (
    "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/"
    "tyt-cografya/files/basic-html/page85.html"
)

WEST_LON = 26.0
EAST_LON = 44.8
NORTH_LAT = 42.1
SOUTH_LAT = 35.8
WEST_PIXEL = 64.0
EAST_PIXEL = 875.0
NORTH_PIXEL = 18.0
SOUTH_PIXEL = 424.0

PALETTE = [
    ("brown-forest-map", "Kahverengi Orman Toprakları", (226, 181, 156)),
    ("calcareous-forest-map", "Kireçli Orman Toprakları", (175, 112, 97)),
    ("brown-chestnut-step-map", "Kahverengi ve Kestane Renkli Step Toprakları", (194, 184, 119)),
    ("terra-rossa-map", "Kırmızı Akdeniz Toprakları (Terra Rossa)", (209, 94, 125)),
    ("red-calcareous-step-map", "Kızıl Renkli Kireçli Step Toprakları", (198, 84, 56)),
    ("rendzina-map", "Rendzina", (173, 215, 198)),
    ("mountain-stony-soil-map", "Dağlık ve Volkanik Arazilerde Kumlu-Taşlı Topraklar", (217, 135, 94)),
    ("chernozem-map", "Çernezyom", (138, 126, 175)),
    ("vertisol-map", "Vertisol", (223, 185, 216)),
    ("saline-alkaline-map", "Çorak (Tuzlu-Alkali) Topraklar", (238, 113, 21)),
    ("alluvial-map", "Alüvyal Topraklar", (250, 240, 142)),
    ("coastal-dune-map", "Kıyı Kumulları", (27, 16, 14)),
    ("podzolized-map", "Podzollaşmış Topraklar", (183, 205, 217)),
]

PODZOL_MEB_BANDS = unary_union(
    [
        Polygon(
            [
                (29.7, 41.0), (30.5, 41.45), (31.5, 41.55),
                (32.5, 41.45), (33.7, 41.55), (34.7, 41.3),
                (34.3, 40.8), (33.2, 40.65), (32.0, 40.7),
                (30.8, 40.65),
            ]
        ),
        Polygon(
            [
                (37.7, 40.8), (38.5, 41.2), (39.5, 41.45),
                (40.7, 41.55), (41.7, 41.4), (42.4, 40.95),
                (41.8, 40.45), (40.5, 40.5), (39.4, 40.45),
                (38.4, 40.4),
            ]
        ),
    ]
)


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


def build_country_mask(width: int, height: int, country) -> np.ndarray:
    image = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(image)
    polygons = [country] if country.geom_type == "Polygon" else list(country.geoms)
    for polygon in polygons:
        draw_polygon_mask(draw, polygon, 1)
    return np.asarray(image, dtype=bool)


def remove_noise(mask: np.ndarray) -> np.ndarray:
    cleaned = mask.copy()
    components, count = label(mask)
    for component_id in range(1, count + 1):
        ys, xs = np.where(components == component_id)
        if len(xs) == 0:
            continue
        width = int(xs.max() - xs.min() + 1)
        height = int(ys.max() - ys.min() + 1)
        is_noise = len(xs) < 18
        is_frame_line = (
            (width > 100 and height <= 2)
            or (height > 100 and width <= 2)
        )
        is_legend = ys.min() > 440
        if is_noise or is_frame_line or is_legend:
            cleaned[components == component_id] = False
    return cleaned


def mask_to_geometry(mask: np.ndarray, country):
    padded = np.pad(mask.astype(np.uint8), 1)
    lines = []
    for contour in find_contours(padded, 0.5):
        if len(contour) < 8:
            continue
        coords = [
            pixel_to_geo(float(col - 1), float(row - 1))
            for row, col in contour
        ]
        if coords[0] != coords[-1]:
            coords.append(coords[0])
        lines.append(LineString(coords))

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

    province_data = json.loads(PROVINCES_PATH.read_text(encoding="utf-8"))
    country = unary_union(
        [
            shape(feature["geometry"]).buffer(0)
            for feature in province_data["features"]
        ]
    ).buffer(0)
    country_mask = build_country_mask(image.width, image.height, country)

    palette_rgb = np.asarray([entry[2] for entry in PALETTE], dtype=np.int32)
    distances = np.sum(
        (pixels[:, :, None, :] - palette_rgb[None, None, :, :]) ** 2,
        axis=3,
    )
    nearest_label = np.argmin(distances, axis=2)
    nearest_distance = np.min(distances, axis=2)
    known_labels = np.full((image.height, image.width), -1, dtype=np.int16)

    for palette_index in range(len(PALETTE)):
        threshold = 18 if PALETTE[palette_index][0] == "coastal-dune-map" else 34
        raw_mask = (
            (nearest_label == palette_index)
            & (nearest_distance <= threshold**2)
        )
        known_labels[remove_noise(raw_mask)] = palette_index

    known = known_labels >= 0
    fill_distance, nearest_indices = distance_transform_edt(
        ~known, return_distances=True, return_indices=True
    )
    filled_labels = known_labels[nearest_indices[0], nearest_indices[1]]
    filled_labels[~country_mask] = -1
    filled_labels[fill_distance > 18] = -1

    features = []
    for palette_index, (feature_id, name, colour) in enumerate(PALETTE):
        geometry = mask_to_geometry(filled_labels == palette_index, country)
        source_url = SOURCE_URL
        geometry_note = "MEB renkli dağılış haritasından vektörleştirildi"
        if feature_id == "podzolized-map":
            # The raster legend names podzolised soils but its tiny high-mountain
            # patches are not recoverable at the published resolution. MEB's
            # accompanying text explicitly places them in the high parts of the
            # Eastern and Western Black Sea mountains.
            geometry = PODZOL_MEB_BANDS.intersection(country).buffer(0)
            source_url = MEB_SOIL_TEXT_URL
            geometry_note = "MEB metnindeki Doğu ve Batı Karadeniz yüksek dağ kuşakları"
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
                    "source_url": source_url,
                    "source_rgb": list(colour),
                    "geometry_note": geometry_note,
                },
                "geometry": mapping(geometry),
            }
        )

    OUTPUT_PATH.write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "name": "MEB Türkiye Toprak Tiplerinin Dağılışı",
                "source": SOURCE_URL,
                "features": features,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    print(f"Yazıldı: {OUTPUT_PATH} ({len(features)} toprak alanı)")


if __name__ == "__main__":
    main()
