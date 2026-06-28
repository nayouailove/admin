from datetime import datetime

from pydantic import BaseModel, Field, model_validator

class UserResponse(BaseModel):
    account_id: str
    name: str
    role: str
    is_active: bool
    created_at: datetime    

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    account_id: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=100)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse       


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=100)
    new_password: str = Field(min_length=4, max_length=100)


class TeacherCreate(BaseModel):
    teacher_account_id: str = Field(min_length=1, max_length=100)
    teacher_name: str = Field(min_length=1, max_length=100)

class TeacherResponse(BaseModel):
    id: int
    account_id: str
    name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class StudentCreate(BaseModel):
    student_account_id: str = Field(min_length=1, max_length=100)
    student_name: str = Field(min_length=1, max_length=100)

    @model_validator(mode="after")
    def strip_fields(self):
        self.student_account_id = self.student_account_id.strip()
        self.student_name = self.student_name.strip()
        if not self.student_account_id:
            raise ValueError("학생 ID를 입력해야 합니다.")
        if not self.student_name:
            raise ValueError("학생 이름을 입력해야 합니다.")
        return self


class StudentResponse(BaseModel):
    id: int
    student_account_id: str
    student_name: str
    created_at: datetime

    class Config:
        from_attributes = True
        #객체에서 값을 꺼내서 응답 json으로 바굴수 있게 해준다.


class StudentBulkCreate(BaseModel):
    students: list[StudentCreate]
    #StudentCreate : (`student_account_id`, `student_name`)


class BulkFailedItem(BaseModel):
    student_account_id: str
    student_name: str
    reason: str


class StudentBulkResponse(BaseModel):
    created: list[StudentResponse]
    failed: list[BulkFailedItem]
