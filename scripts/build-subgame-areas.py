"""Build MEB-grounded exact areas for soil and vegetation subgames.

The general distribution maps are official MEB raster vectors.  This script
derives the more specific textbook subcategories by clipping those vectors to
the regions explicitly described in MEB's TYT topic summaries.  The result
replaces the old decorative rectangles with geographic multipolygons.
"""

from __future__ import annotations

import json
from pathlib import Path

from shapely import affinity
from shapely.geometry import LineString, Point, Polygon, box, mapping, shape
from shapely.ops import unary_union


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "public" / "data"
OUTPUT = DATA / "turkey-subgame-areas.geojson"

MEB_SOIL = (
    "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/"
    "tyt-cografya/files/basic-html/page86.html"
)
MEB_FOREST = (
    "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/"
    "tyt-cografya/files/basic-html/page90.html"
)
MEB_VEGETATION = (
    "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/"
    "tyt-cografya/files/basic-html/page91.html"
)


def read_features(name: str) -> dict[str, object]:
    data = json.loads((DATA / name).read_text(encoding="utf-8"))
    return {
        feature["properties"]["id"]: shape(feature["geometry"]).buffer(0)
        for feature in data["features"]
    }


def read_named_geometry(name: str, feature_id: str):
    features = read_features(name)
    if feature_id not in features:
        raise RuntimeError(f"{feature_id} not found in {name}")
    return features[feature_id]


def country_geometry():
    data = json.loads((DATA / "turkey-provinces.geojson").read_text(encoding="utf-8"))
    return unary_union([shape(feature["geometry"]).buffer(0) for feature in data["features"]]).buffer(0)


def useful_geometry(geometry, country):
    clipped = geometry.intersection(country).buffer(0).simplify(0.018, preserve_topology=True)
    if clipped.is_empty:
        raise RuntimeError("Generated subgame geometry is empty")
    return clipped


def feature(feature_id: str, name: str, geometry, source_url: str, note: str):
    return {
        "type": "Feature",
        "id": feature_id,
        "properties": {
            "id": feature_id,
            "name": name,
            "source": "MEB",
            "source_url": source_url,
            "geometry_note": note,
        },
        "geometry": mapping(geometry),
    }


def buffered_points(points, radius):
    return unary_union([Point(lon, lat).buffer(radius, resolution=14) for lon, lat in points])


def buffered_lines(lines, radius):
    return unary_union([LineString(line).buffer(radius, resolution=10) for line in lines])


def main() -> None:
    country = country_geometry()
    vegetation = read_features("turkey-vegetation-distribution.geojson")

    forest = vegetation["forest-map"]
    maquis_all = vegetation["maquis-map"]

    # MEB's four forest regions.  The envelopes follow the named coastal,
    # Taurus/Western and inward-facing mountain sectors; clipping preserves the
    # official forest-map edges and prevents invented forest cover.
    north_envelope = Polygon([
        (25.8, 39.75), (28.0, 39.55), (30.0, 40.05), (32.0, 40.05),
        (34.0, 39.75), (36.0, 39.55), (38.0, 39.25), (40.0, 39.05),
        (42.0, 38.85), (45.2, 38.9), (45.2, 42.5), (25.8, 42.5),
    ])
    mediterranean_envelope = Polygon([
        (25.8, 35.4), (45.2, 35.4), (45.2, 37.75), (42.5, 38.15),
        (39.5, 38.05), (37.0, 38.45), (34.0, 38.55), (31.0, 38.25),
        (28.2, 37.85), (25.8, 38.4),
    ])
    west_envelope = box(25.7, 37.25, 30.8, 40.85)

    forest_north = useful_geometry(forest.intersection(north_envelope), country)
    forest_med = useful_geometry(
        forest.intersection(mediterranean_envelope).difference(forest_north), country
    )
    forest_west = useful_geometry(
        forest.intersection(west_envelope).difference(unary_union([forest_north, forest_med])),
        country,
    )
    forest_interior = useful_geometry(
        forest.difference(unary_union([forest_north, forest_med, forest_west])), country
    )

    # Garig is most characteristic on Aegean peninsulas/islands and on shallow
    # coastal Mediterranean soils.  It is carved out of the official MEB maquis
    # area so the two click targets never conceal one another.
    garig_sectors = unary_union([
        box(25.8, 36.7, 29.4, 39.45),
        buffered_lines([
            [(29.0, 36.35), (31.0, 36.55), (33.2, 36.25)],
            [(35.0, 36.25), (36.3, 36.2)],
        ], 0.20),
    ])
    garig = useful_geometry(maquis_all.intersection(garig_sectors), country)
    maquis = useful_geometry(maquis_all.difference(garig), country)

    # Psödomaki: MEB places it in the Black Sea coastal strip up to roughly
    # 200 m.  This coastal envelope is intersected with official forest cover.
    pseudo_envelope = Polygon([
        (27.6, 40.55), (29.0, 40.75), (31.0, 40.95), (33.0, 40.75),
        (35.0, 40.55), (37.0, 40.45), (39.0, 40.15), (41.0, 40.05),
        (43.0, 40.25), (45.2, 40.0), (45.2, 42.5), (27.6, 42.5),
    ])
    pseudomaquis = useful_geometry(forest.intersection(pseudo_envelope), country)

    # Hydromorphic soils: exact MEB examples around Köyceğiz, Işıklı,
    # Sultan Sazlığı and Abant.  Narrow rings represent saturated lake margins.
    koycegiz = read_named_geometry("turkey-natural-set-lakes.geojson", "koycegiz-set")
    abant = read_named_geometry("turkey-natural-set-lakes.geojson", "abant-set")
    sultan = read_named_geometry("turkey-ramsar.geojson", "sultan-sazligi")
    isikli = affinity.rotate(
        affinity.scale(Point(29.92, 38.22).buffer(0.10, resolution=18), 1.55, 0.70),
        -18,
        origin="centroid",
    )
    hydromorphic = useful_geometry(unary_union([
        koycegiz.buffer(0.055),
        isikli,
        sultan.buffer(0.045),
        abant.buffer(0.055),
    ]), country)

    # Colluvial soils accumulate at the feet of Aydın Mountains, Bozdağlar and
    # the Taurus system, the examples explicitly listed by MEB.
    colluvial = useful_geometry(buffered_lines([
        [(27.0, 38.05), (28.2, 38.0), (29.0, 37.85)],
        [(27.0, 38.75), (28.2, 38.65), (29.2, 38.45)],
        [(29.0, 36.75), (29.8, 36.9), (30.5, 37.1), (31.2, 37.0), (32.0, 37.15)],
        [(32.6, 37.0), (33.3, 37.05), (34.0, 37.2), (34.8, 37.25), (35.6, 37.45)],
        [(36.5, 37.35), (37.1, 37.6), (37.8, 37.72), (38.5, 37.62),
         (39.2, 37.82), (40.0, 37.72)],
    ], 0.11), country)

    # Regosols occur on young volcanic material in Central/Eastern Anatolia and
    # at Kula.  These are compact volcanic fields, not a country-wide rectangle.
    regosol = useful_geometry(buffered_points([
        (28.65, 38.55),  # Kula
        (30.55, 38.55),  # Afyon volcanic field
        (34.75, 38.65),  # Cappadocia
        (35.45, 38.75),  # Erciyes sector
        (42.25, 39.35),  # Ağrı-Tendürek sector
        (42.75, 38.75),  # Süphan-Nemrut sector
    ], 0.35), country)

    # MEB defines loess generically as wind deposits; the principal KPSS map
    # example is the dry Konya basin sector.
    loess = useful_geometry(buffered_points([(32.55, 38.0)], 0.48), country)

    # Moraines are restricted to Turkey's presently or formerly glaciated high
    # massifs; the points follow MEB's standard glacial-mountain examples.
    moraine = useful_geometry(buffered_lines([
        [(29.08, 40.02), (29.30, 40.13)],  # Uludağ
        [(32.05, 40.75), (32.45, 40.90)],  # Bolu-Köroğlu
        [(37.35, 40.55), (37.75, 40.72)],  # Karagöl
        [(40.55, 40.72), (41.15, 40.92)],  # Kaçkar
        [(42.18, 39.58), (42.52, 39.82)],  # Ağrı
        [(43.85, 37.35), (44.38, 37.58)],  # Cilo-Sat
        [(35.32, 38.42), (35.58, 38.62)],  # Erciyes
        [(34.82, 37.30), (35.28, 37.58)],  # Aladağlar
        [(32.20, 37.05), (32.70, 37.27)],  # Bolkar
    ], 0.085), country)

    output_features = [
        feature("forest-black", "Kuzey Anadolu Ormanları", forest_north, MEB_FOREST,
                "MEB orman haritasının Kuzey Anadolu orman kuşağı"),
        feature("forest-med", "Akdeniz Ormanları", forest_med, MEB_FOREST,
                "MEB orman haritasının Toros-Akdeniz orman kuşağı"),
        feature("forest-west", "Batı Anadolu Ormanları", forest_west, MEB_FOREST,
                "MEB orman haritasının Batı Anadolu kesimi"),
        feature("forest-interior", "İç Bölge Ormanları", forest_interior, MEB_FOREST,
                "MEB orman haritasında içe bakan yamaçlar ve iç dağ parçaları"),
        feature("maquis", "Maki", maquis, MEB_VEGETATION,
                "MEB maki alanı; ayrı garig hedefleri çıkarıldı"),
        feature("garig-veg", "Garig (Frigana)", garig, MEB_VEGETATION,
                "MEB maki alanında Ege yarımadaları ve sığ topraklı Akdeniz kıyıları"),
        feature("pseudomaquis-veg", "Psödomaki", pseudomaquis, MEB_VEGETATION,
                "MEB orman alanının Karadeniz kıyı kuşağı"),
        feature("hydromorphic-soil", "Hidromorfik Toprak", hydromorphic, MEB_SOIL,
                "Köyceğiz, Işıklı, Sultan Sazlığı ve Abant kenarları"),
        feature("colluvial-soil", "Kolüvyal Toprak", colluvial, MEB_SOIL,
                "Aydın Dağları, Bozdağlar ve Toros etekleri"),
        feature("regosol-soil", "Regosol", regosol, MEB_SOIL,
                "İç ve Doğu Anadolu volkanik alanları ile Kula"),
        feature("loess-soil", "Lös", loess, MEB_SOIL,
                "Rüzgâr birikimi; Konya kapalı havzası örnek alanı"),
        feature("moraine-soil", "Moren", moraine, MEB_SOIL,
                "Türkiye'nin yüksek buzul dağlarındaki moren alanları"),
    ]

    OUTPUT.write_text(json.dumps({
        "type": "FeatureCollection",
        "name": "MEB Toprak ve Bitki Alt Oyun Alanları",
        "features": output_features,
    }, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Yazıldı: {OUTPUT} ({len(output_features)} alt oyun alanı)")


if __name__ == "__main__":
    main()
