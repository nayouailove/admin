from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.model import User
from app.schema import LoginRequest, LoginResponse, PasswordChangeRequest, UserResponse
from app.security import create_access_token, hash_password, verify_password


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.account_id == login_data.account_id)
        .first()
    )

    if user is None or user.password_hash is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="계정 ID 또는 비밀번호를 확인해주세요.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="비활성화된 계정입니다.",
        )

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="계정 ID 또는 비밀번호를 확인해주세요.",
        )

    access_token = create_access_token(
        {
            "sub": user.account_id,
            "role": user.role,
        }
    )

    return LoginResponse(
        access_token=access_token,
        user=user,
    )


@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/password", response_model=UserResponse)
def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.password_hash is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비밀번호를 변경할 수 없는 계정입니다.",
        )

    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="현재 비밀번호가 올바르지 않습니다.",
        )

    current_user.password_hash = hash_password(password_data.new_password)

    db.commit()
    db.refresh(current_user)

    return current_user
