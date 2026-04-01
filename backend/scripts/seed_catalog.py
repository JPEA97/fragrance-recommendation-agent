import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.brand import Brand
from app.models.fragrance import Fragrance
from app.models.fragrance_tag import FragranceTag
from app.models.tag import Tag

DATA_FILE = Path(__file__).parent / "data" / "catalog.json"


def load_catalog() -> dict:
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def seed_catalog(db: Session) -> None:
    catalog = load_catalog()

    brand_map: dict[str, Brand] = {}
    tag_map: dict[tuple[str, str], Tag] = {}

    for brand_data in catalog["brands"]:
        brand = db.query(Brand).filter(Brand.name == brand_data["name"]).first()
        if not brand:
            brand = Brand(name=brand_data["name"])
            db.add(brand)
            db.flush()
        brand_map[brand.name] = brand

    for tag_data in catalog["tags"]:
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

    for fragrance_data in catalog["fragrances"]:
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
        else:
            fragrance.release_year = fragrance_data["release_year"]
            fragrance.gender_category = fragrance_data["gender_category"]
            fragrance.description = fragrance_data["description"]

        desired_tag_ids = {
            tag_map[(tag_type, tag_name)].id
            for tag_type, tag_name in fragrance_data["tags"]
        }

        existing_links = (
            db.query(FragranceTag)
            .filter(FragranceTag.fragrance_id == fragrance.id)
            .all()
        )
        existing_tag_ids = {link.tag_id for link in existing_links}

        for link in existing_links:
            if link.tag_id not in desired_tag_ids:
                db.delete(link)

        for tag_id in desired_tag_ids - existing_tag_ids:
            db.add(FragranceTag(fragrance_id=fragrance.id, tag_id=tag_id))

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
