from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException, status

from app.config import settings
from app.database import get_db
from app.model import TeacherStudent, User
from app.schema import StudentCreate, StudentResponse, TeacherResponse


router = APIRouter()
#router는 라우터 객체, 라우터는 API의 엔드포인트들을 그룹화하는데 사용된다.


# 로그인한 선생님 정보를 가져온다. (현재는 개발용으로 고정된 선생님 정보를 반환한다.)
def get_current_teacher() -> TeacherResponse:
    return TeacherResponse(
        teacher_account_id=settings.dev_teacher_id,
        display_name=settings.dev_teacher_name,
    )


#GET /me : 로그인한 선생님의 정보를 반환
@router.get("/me", response_model=TeacherResponse)
def read_me():
    return get_current_teacher()


#GET /students : 로그인한 선생님이 등록한 학생들의 목록을 반환
@router.get("/students", response_model=list[StudentResponse])
def read_students(db: Session = Depends(get_db)):
    teacher = get_current_teacher()

    return (
        db.query(TeacherStudent)
        .filter(TeacherStudent.teacher_account_id == teacher.teacher_account_id)
        .order_by(TeacherStudent.created_at.desc())
        .all()
    )


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


#POST /students : 학생 등록
@router.post(
    "/students",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_student(student_data: StudentCreate, db: Session = Depends(get_db)):
    teacher = get_current_teacher()
    student_user = find_student_user(student_data, db)

    student = TeacherStudent(
        teacher_account_id=teacher.teacher_account_id,
        student_account_id=student_user.account_id,
        student_name=student_user.name,
    )

    db.add(student)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 등록된 학생 ID입니다.",
        )

    db.refresh(student)
    return student

# DELETE /students/{student_id} : 학생 삭제
@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    teacher = get_current_teacher()

    student = (
        db.query(TeacherStudent)
        .filter(
            TeacherStudent.id == student_id,
            TeacherStudent.teacher_account_id == teacher.teacher_account_id,
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="학생을 찾을 수 없습니다.",
        )

    db.delete(student)
    db.commit()
