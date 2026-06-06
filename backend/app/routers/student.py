from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_teacher
from app.model import TeacherStudent, User
from app.schema import StudentCreate, StudentResponse


router = APIRouter(tags=["students"])


def find_student_user(student_data: StudentCreate, db: Session) -> User:
    if student_data.student_account_id:
        student = (
            db.query(User)
            .filter(
                User.account_id == student_data.student_account_id,
                User.role == "student",
            )
            .first()
        )

        if student is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="해당 학생 ID를 가진 계정을 찾을 수 없습니다.",
            )

        return student

    matched_students = (
        db.query(User)
        .filter(
            User.name == student_data.student_name,
            User.role == "student",
        )
        .all()
    )

    if not matched_students:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 이름을 가진 학생 계정을 찾을 수 없습니다.",
        )

    if len(matched_students) > 1:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="동명이인이 있어 학생 ID로 등록해주세요.",
        )

    return matched_students[0]


@router.get("/students", response_model=list[StudentResponse])
def read_students(
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    return (
        db.query(TeacherStudent)
        .filter(TeacherStudent.teacher_account_id == current_user.account_id)
        .order_by(TeacherStudent.created_at.desc())
        .all()
    )


@router.post(
    "/students",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student(
    student_data: StudentCreate,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    student_user = find_student_user(student_data, db)

    teacher_student = TeacherStudent(
        teacher_account_id=current_user.account_id,
        student_account_id=student_user.account_id,
        student_name=student_user.name,
    )

    db.add(teacher_student)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 등록된 학생 ID입니다.",
        )

    db.refresh(teacher_student)
    return teacher_student


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    current_user: User = Depends(require_teacher),
    db: Session = Depends(get_db),
):
    teacher_student = (
        db.query(TeacherStudent)
        .filter(
            TeacherStudent.id == student_id,
            TeacherStudent.teacher_account_id == current_user.account_id,
        )
        .first()
    )

    if teacher_student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="학생을 찾을 수 없습니다.",
        )

    db.delete(teacher_student)
    db.commit()
