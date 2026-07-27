"""Build named physical-region areas from MEB's 15-location population map."""

from __future__ import annotations

import json
from pathlib import Path

from shapely.geometry import LineString, Polygon, mapping, shape
from shapely.ops import unary_union


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"
OUTPUT = DATA / "turkey-population-areas.geojson"
MEB_SOURCE = (
    "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/"
    "defterim/10/cografya/files/basic-html/page139.html"
)


def feature_map(name: str):
    data = json.loads((DATA / name).read_text(encoding="utf-8"))
    return {
        item["properties"]["id"]: shape(item["geometry"]).buffer(0)
        for item in data["features"]
    }


def country_geometry():
    data = json.loads((DATA / "turkey-provinces.geojson").read_text(encoding="utf-8"))
    return unary_union([shape(item["geometry"]).buffer(0) for item in data["features"]]).buffer(0)


def clipped(geometry, country):
    result = geometry.intersection(country).buffer(0).simplify(0.012, preserve_topology=True)
    if result.is_empty:
        raise RuntimeError("Population geometry is empty")
    return result


def output_feature(feature_id: str, name: str, geometry, note: str):
    return {
        "type": "Feature",
        "id": feature_id,
        "properties": {
            "id": feature_id,
            "name": name,
            "source": "MEB",
            "source_url": MEB_SOURCE,
            "geometry_note": note,
        },
        "geometry": mapping(geometry),
    }


def main():
    country = country_geometry()
    lakes = feature_map("turkey-lakes.geojson")

    yildiz = clipped(
        LineString([(26.7, 41.6), (27.5, 41.7), (28.7, 41.6)]).buffer(
            0.24, resolution=14
        ),
        country,
    )
    teke = clipped(
        Polygon([
            (28.55, 36.15), (29.35, 36.05), (30.25, 36.18),
            (31.05, 36.62), (30.80, 37.28), (30.05, 37.62),
            (29.22, 37.42), (28.62, 36.88),
        ]),
        country,
    )
    taseli = clipped(
        Polygon([
            (30.95, 36.02), (34.55, 36.02), (34.25, 36.82),
            (33.55, 37.28), (32.35, 37.52), (31.30, 37.22),
            (30.95, 36.62),
        ]),
        country,
    )
    tuz_lake = lakes["tuz"]
    tuz_surroundings = clipped(
        tuz_lake.buffer(0.58, resolution=16).difference(tuz_lake.buffer(0.045)),
        country,
    )

    features = [
        output_feature(
            "population-yildiz",
            "Yıldız Dağları · Seyrek",
            yildiz,
            "MEB'deki Yıldız Dağları konumu; gerçek dağ ekseni boyunca",
        ),
        output_feature(
            "population-teke",
            "Teke Yöresi · Seyrek",
            teke,
            "MEB'deki Teke Yöresi; Teke Yarımadası fiziki sınır odağı",
        ),
        output_feature(
            "population-taseli",
            "Taşeli Yöresi · Seyrek",
            taseli,
            "MEB'deki Taşeli Yöresi; Taşeli Platosu fiziki sınır odağı",
        ),
        output_feature(
            "population-tuz-lake",
            "Tuz Gölü Çevresi · Seyrek",
            tuz_surroundings,
            "MEB'deki tuzlu toprak odağı; gerçek Tuz Gölü kıyı çevresi",
        ),
    ]
    OUTPUT.write_text(
        json.dumps(
            {
                "type": "FeatureCollection",
                "name": "MEB Nüfus Haritası Fiziki Yöreleri",
                "features": features,
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    print(f"Yazıldı: {OUTPUT} ({len(features)} alan)")


if __name__ == "__main__":
    main()
