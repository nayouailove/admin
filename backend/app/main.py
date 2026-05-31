#app객체는 fastapi의 핵심객체, 전체적인 환경을 설정

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine
from app.model import User
from app.routers.student import router as students_router



Base.metadata.create_all(bind=engine)


def seed_users():
    seed_data = [
        {"account_id": "teacher1", "name": "김선생", "role": "teacher"},
        {"account_id": "test1", "name": "김민수", "role": "student"},
        {"account_id": "test2", "name": "이지아", "role": "student"},
        {"account_id": "test3", "name": "김민수", "role": "student"},
        {"account_id": "test100", "name": "테스트학생", "role": "student"},
        {"account_id": "same10", "name": "same", "role": "student"},
        {"account_id": "same20", "name": "same", "role": "student"},
    ]

    with Session(engine) as db:
        for user_data in seed_data:
            exists = (
                db.query(User)
                .filter(User.account_id == user_data["account_id"])
                .first()
            )

            if exists is None:
                db.add(User(**user_data))

        db.commit()


seed_users()

app = FastAPI(title="학생 채팅 관리자 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(students_router)
#import student --> app.include_router(student.router)
