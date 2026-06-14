from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_teacher
from app.model import TeacherStudent, User
from app.schema import StudentCreate, StudentResponse


router = APIRouter(tags=["students"])


def get_or_create_student_user(student_data: StudentCreate, db: Session) -> User:
    existing = (
        db.query(User)
        .filter(User.account_id == student_data.student_account_id)
        .first()
    )

    if existing is not None:  
        if existing.role != "student":
            raise HTTPException(    
                status_code=status.HTTP_409_CONFLICT,
                detail="해당 ID는 학생 계정이 아닙니다.",
            )
        if existing.name != student_data.student_name:
            raise HTTPException(
                 status_code=status.HTTP_409_CONFLICT,
                 detail="이미 등록되어 있는 ID입니다.",
        )
        return existing

    new_user = User(
        account_id=student_data.student_account_id,
        name=student_data.student_name,
        role="student",
    )
    db.add(new_user)
    return new_user


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
    student_user = get_or_create_student_user(student_data, db)

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
