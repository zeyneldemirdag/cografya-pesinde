"""Vectorize the official MEB Turkey climate map into clickable GeoJSON.

The source is a raster teaching map, so the script:
1. classifies its seven legend colours,
2. fills administrative-boundary pixels from the nearest classified pixel,
3. clips the result to the exact province union used by the game, and
4. exports simplified, topology-preserving polygons.
"""

from __future__ import annotations

import io
import json
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt, label
from shapely.geometry import LineString, Polygon, box, mapping, shape
from shapely.ops import polygonize, unary_union
from skimage.measure import find_contours


ROOT = Path(__file__).resolve().parents[1]
PROVINCES_PATH = ROOT / "public" / "data" / "turkey-provinces.geojson"
OUTPUT_PATH = ROOT / "public" / "data" / "turkey-climate-zones.geojson"
SOURCE_URL = (
    "https://ogmmateryal.eba.gov.tr/panel/upload/images/yaitv3gvmoj.png"
)

# The official raster uses a simple Turkey-wide map frame. These anchors align
# İstanbul, Sinop, the Mediterranean coast and the eastern border with EPSG:4326.
WEST_LON = 26.0
EAST_LON = 44.8
NORTH_LAT = 42.1
SOUTH_LAT = 35.8
WEST_PIXEL = 43.0
EAST_PIXEL = 823.0
NORTH_PIXEL = 21.0
SOUTH_PIXEL = 398.0

PALETTE = [
    ("akdeniz-cl", "Akdeniz İklimi", (232, 67, 32)),
    ("akdeniz-karasal-gecis-cl", "Akdeniz-Karasal Geçiş İklimi", (250, 180, 18)),
    ("karadeniz-cl", "Karadeniz İklimi", (115, 149, 87)),
    ("akdeniz-karadeniz-gecis-cl", "Akdeniz-Karadeniz Geçiş İklimi", (64, 82, 159)),
    ("karasal-karadeniz-gecis-cl", "Karasal-Karadeniz Geçiş İklimi", (162, 180, 138)),
    ("karasal-cl", "Karasal İklim", (240, 229, 8)),
    ("karasal-sert-gecis-cl", "Karasal-Sert Karasal Geçiş İklimi", (127, 109, 89)),
]

# The source page also contains coloured borders and legend marks. Geographic
# envelopes prevent those cartographic decorations from becoming quiz areas.
EXPECTED_ENVELOPES = {
    "akdeniz-cl": box(25.4, 35.5, 38.3, 40.05),
    "akdeniz-karasal-gecis-cl": box(25.4, 35.5, 40.5, 41.35),
    "karadeniz-cl": box(25.4, 39.9, 43.0, 42.3),
    "akdeniz-karadeniz-gecis-cl": box(25.4, 38.7, 31.7, 42.3),
    "karasal-karadeniz-gecis-cl": box(25.4, 39.65, 42.2, 42.3),
    "karasal-cl": box(25.4, 35.5, 44.9, 42.3),
    "karasal-sert-gecis-cl": box(39.3, 35.5, 44.9, 42.3),
}


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
    exterior = [geo_to_pixel(lon, lat) for lon, lat in polygon.exterior.coords]
    draw.polygon(exterior, fill=fill)
    for interior in polygon.interiors:
        draw.polygon(
            [geo_to_pixel(lon, lat) for lon, lat in interior.coords],
            fill=0,
        )


def build_country_mask(width: int, height: int, country) -> np.ndarray:
    mask_image = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask_image)
    polygons = [country] if country.geom_type == "Polygon" else list(country.geoms)
    for polygon in polygons:
        draw_polygon_mask(draw, polygon, 1)
    return np.asarray(mask_image, dtype=bool)


def remove_legend_swatch_components(mask: np.ndarray) -> np.ndarray:
    cleaned = mask.copy()
    components, count = label(mask)
    for component_id in range(1, count + 1):
        ys, xs = np.where(components == component_id)
        if len(xs) == 0:
            continue
        width = int(xs.max() - xs.min() + 1)
        height = int(ys.max() - ys.min() + 1)
        rectangularity = len(xs) / max(width * height, 1)
        is_noise = len(xs) < 100
        is_frame_line = (
            (width > 80 and height <= 2)
            or (height > 80 and width <= 2)
        )
        is_legend_swatch = (
            xs.min() > 470
            and ys.min() > 330
            and 12 <= width <= 40
            and 7 <= height <= 24
            and rectangularity > 0.68
        )
        if is_noise or is_frame_line or is_legend_swatch:
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

    result = unary_union(pieces).intersection(country).buffer(0)
    return result.simplify(0.012, preserve_topology=True)


def main() -> None:
    request = urllib.request.Request(
        SOURCE_URL, headers={"User-Agent": "KPSS-Cografya-Pesinde/1.0"}
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        image = Image.open(io.BytesIO(response.read())).convert("RGB")
    pixels = np.asarray(image, dtype=np.int16)

    province_data = json.loads(PROVINCES_PATH.read_text(encoding="utf-8"))
    country = unary_union(
        [
            shape(feature["geometry"]).buffer(0)
            for feature in province_data["features"]
        ]
    ).buffer(0)
    country_mask = build_country_mask(image.width, image.height, country)

    palette_rgb = np.asarray([entry[2] for entry in PALETTE], dtype=np.int16)
    distances = np.sum(
        (pixels[:, :, None, :] - palette_rgb[None, None, :, :]) ** 2,
        axis=3,
    )
    nearest_label = np.argmin(distances, axis=2)
    nearest_distance = np.min(distances, axis=2)

    known_labels = np.full((image.height, image.width), -1, dtype=np.int16)
    for palette_index in range(len(PALETTE)):
        raw_mask = (nearest_label == palette_index) & (nearest_distance <= 32**2)
        raw_mask = remove_legend_swatch_components(raw_mask)
        known_labels[raw_mask] = palette_index

    known = known_labels >= 0
    fill_distance, nearest_indices = distance_transform_edt(
        ~known, return_distances=True, return_indices=True
    )
    filled_labels = known_labels[
        nearest_indices[0],
        nearest_indices[1],
    ]
    filled_labels[~country_mask] = -1
    # Do not extrapolate a coastal colour far beyond the source-map outline.
    # Twenty pixels is ample for province strokes and antialiasing gaps.
    filled_labels[fill_distance > 20] = -1

    features = []
    for palette_index, (feature_id, name, colour) in enumerate(PALETTE):
        geometry = mask_to_geometry(
            filled_labels == palette_index, country
        ).intersection(EXPECTED_ENVELOPES[feature_id]).buffer(0)
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

    result = {
        "type": "FeatureCollection",
        "name": "MEB Türkiye İklim Bölgeleri",
        "source": SOURCE_URL,
        "features": features,
    }
    OUTPUT_PATH.write_text(
        json.dumps(result, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Yazıldı: {OUTPUT_PATH} ({len(features)} iklim bölgesi)")


if __name__ == "__main__":
    main()
