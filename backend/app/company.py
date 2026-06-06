from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_company_admin
from app.model import TeacherStudent, User
from app.schema import TeacherCreate, TeacherResponse
from app.security import hash_password


router = APIRouter(prefix="/company", tags=["company"])


@router.get("/teachers", response_model=list[TeacherResponse])
def read_teachers(
    current_user: User = Depends(require_company_admin),
    db: Session = Depends(get_db),
):
    return (
        db.query(User)
        .filter(User.role == "teacher")
        .order_by(User.created_at.desc())
        .all()
    )


@router.post(
    "/teachers",
    response_model=TeacherResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_teacher(
    teacher_data: TeacherCreate,
    current_user: User = Depends(require_company_admin),
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.account_id == teacher_data.teacher_account_id)
        .first()
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 존재하는 계정 ID입니다.",
        )

    teacher = User(
        account_id=teacher_data.teacher_account_id,
        name=teacher_data.teacher_name,
        role="teacher",
        password_hash=hash_password("0000"),
        is_active=True,
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    return teacher


@router.delete("/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_teacher(
    teacher_id: int,
    current_user: User = Depends(require_company_admin),
    db: Session = Depends(get_db),
):
    teacher = (
        db.query(User)
        .filter(User.id == teacher_id, User.role == "teacher")
        .first()
    )

    if teacher is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="선생님을 찾을 수 없습니다.",
        )
    
    db.query(TeacherStudent).filter(
        TeacherStudent.teacher_account_id == teacher.account_id
    ).delete()

    db.delete(teacher)
    db.commit()