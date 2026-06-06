from sqlalchemy.orm import Session

from app.database import engine
from app.model import User
from app.security import hash_password


def upsert_user(db: Session, user_data: dict):
    existing_user = (
        db.query(User)
        .filter(User.account_id == user_data["account_id"])
        .first()
    )

    if existing_user is None:
        db.add(User(**user_data))
        return

    for key, value in user_data.items():
        setattr(existing_user, key, value)


def seed_users():
    seed_data = [
        {
            "account_id": "io",
            "name": "회사관리자",
            "role": "company_admin",
            "password_hash": hash_password("admin0000"),
            "is_active": True,
        },
        {
            "account_id": "tea1",
            "name": "학원1",
            "role": "teacher",
            "password_hash": hash_password("0000"),
            "is_active": True,
        },
        {
            "account_id": "tea12",
            "name": "햇님유치원",
            "role": "teacher",
            "password_hash": hash_password("0000"),
            "is_active": True,
        },
        {
            "account_id": "test100",
            "name": "테스트학생",
            "role": "student",
            "password_hash": None,
            "is_active": True,
        },
        {
            "account_id": "same1",
            "name": "same",
            "role": "student",
            "password_hash": None,
            "is_active": True,
        },
        {
            "account_id": "same2",
            "name": "same",
            "role": "student",
            "password_hash": None,
            "is_active": True,
        },
    ]

    with Session(engine) as db:
        for user_data in seed_data:
            upsert_user(db, user_data)

        db.commit()


if __name__ == "__main__":
    seed_users()
    print("Seed data inserted.")
