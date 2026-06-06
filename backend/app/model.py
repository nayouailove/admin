from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    account_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100), index=True)
    role: Mapped[str] = mapped_column(String(20), index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC)
    )


class TeacherStudent(Base):
    __tablename__ = "teacher_students"
    __table_args__ = (
        UniqueConstraint(
            "teacher_account_id",
            "student_account_id",
            name="unique_teacher_student_registration",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    teacher_account_id: Mapped[str] = mapped_column(String(100), index=True)
    student_account_id: Mapped[str] = mapped_column(String(100), index=True)
    student_name: Mapped[str] = mapped_column(String(100), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
