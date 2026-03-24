from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.brand import Brand
from app.models.fragrance import Fragrance
from app.models.tag import Tag
from app.models.fragrance_tag import FragranceTag


CATALOG = {
    "brands": [
        {"name": "Dior"},
        {"name": "Chanel"},
        {"name": "Yves Saint Laurent"},
    ],
    "tags": [
        {"type": "season", "name": "fall"},
        {"type": "season", "name": "winter"},
        {"type": "season", "name": "spring"},
        {"type": "occasion", "name": "formal"},
        {"type": "occasion", "name": "casual"},
        {"type": "occasion", "name": "date"},
        {"type": "time_of_day", "name": "day"},
        {"type": "time_of_day", "name": "evening"},
        {"type": "time_of_day", "name": "night"},
        {"type": "weather", "name": "cold"},
        {"type": "weather", "name": "mild"},
        {"type": "location_type", "name": "indoor"},
        {"type": "location_type", "name": "outdoor"},
        {"type": "accord", "name": "woody"},
        {"type": "accord", "name": "powdery"},
        {"type": "accord", "name": "fresh"},
        {"type": "note", "name": "iris"},
        {"type": "note", "name": "vanilla"},
        {"type": "note", "name": "bergamot"},
    ],
    "fragrances": [
        {
            "brand": "Dior",
            "name": "Dior Homme Intense",
            "release_year": 2011,
            "gender_category": "masculine",
            "description": "Elegant iris-forward fragrance for cooler weather.",
            "tags": [
                ("season", "fall"),
                ("season", "winter"),
                ("occasion", "formal"),
                ("occasion", "date"),
                ("time_of_day", "evening"),
                ("time_of_day", "night"),
                ("weather", "cold"),
                ("location_type", "indoor"),
                ("accord", "powdery"),
                ("accord", "woody"),
                ("note", "iris"),
                ("note", "vanilla"),
            ],
        },
        {
            "brand": "Chanel",
            "name": "Bleu de Chanel",
            "release_year": 2010,
            "gender_category": "masculine",
            "description": "Versatile woody aromatic fragrance.",
            "tags": [
                ("season", "spring"),
                ("season", "fall"),
                ("occasion", "casual"),
                ("occasion", "formal"),
                ("time_of_day", "day"),
                ("time_of_day", "evening"),
                ("weather", "mild"),
                ("location_type", "indoor"),
                ("location_type", "outdoor"),
                ("accord", "woody"),
                ("accord", "fresh"),
                ("note", "bergamot"),
            ],
        },
        {
            "brand": "Yves Saint Laurent",
            "name": "La Nuit de L'Homme",
            "release_year": 2009,
            "gender_category": "masculine",
            "description": "Smooth spicy fragrance for evenings and dates.",
            "tags": [
                ("season", "fall"),
                ("season", "winter"),
                ("occasion", "date"),
                ("occasion", "casual"),
                ("time_of_day", "evening"),
                ("time_of_day", "night"),
                ("weather", "cold"),
                ("location_type", "indoor"),
                ("accord", "woody"),
                ("note", "bergamot"),
            ],
        },
    ],
}


def seed_catalog(db: Session) -> None:
    brand_map = {}
    tag_map = {}

    for brand_data in CATALOG["brands"]:
        brand = db.query(Brand).filter(Brand.name == brand_data["name"]).first()
        if not brand:
            brand = Brand(name=brand_data["name"])
            db.add(brand)
            db.flush()
        brand_map[brand.name] = brand

    for tag_data in CATALOG["tags"]:
        tag = (
            db.query(Tag)
            .filter(Tag.type == tag_data["type"], Tag.name == tag_data["name"])
            .first()
        )
        if not tag:
            tag = Tag(type=tag_data["type"], name=tag_data["name"])
            db.add(tag)
            db.flush()
        tag_map[(tag.type, tag.name)] = tag

    for fragrance_data in CATALOG["fragrances"]:
        brand = brand_map[fragrance_data["brand"]]

        fragrance = (
            db.query(Fragrance)
            .filter(
                Fragrance.brand_id == brand.id,
                Fragrance.name == fragrance_data["name"],
            )
            .first()
        )

        if not fragrance:
            fragrance = Fragrance(
                brand_id=brand.id,
                name=fragrance_data["name"],
                release_year=fragrance_data["release_year"],
                gender_category=fragrance_data["gender_category"],
                description=fragrance_data["description"],
            )
            db.add(fragrance)
            db.flush()

        for tag_key in fragrance_data["tags"]:
            tag = tag_map[tag_key]

            existing_link = (
                db.query(FragranceTag)
                .filter(
                    FragranceTag.fragrance_id == fragrance.id,
                    FragranceTag.tag_id == tag.id,
                )
                .first()
            )

            if not existing_link:
                db.add(
                    FragranceTag(
                        fragrance_id=fragrance.id,
                        tag_id=tag.id,
                    )
                )

    db.commit()


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_catalog(db)
        print("Catalog seeded successfully.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
