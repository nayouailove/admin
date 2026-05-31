from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class TeacherResponse(BaseModel):
    teacher_account_id: str
    display_name: str


class StudentCreate(BaseModel):
    student_account_id: str | None = Field(default=None, max_length=100)
    student_name: str | None = Field(default=None, max_length=100)

    @model_validator(mode="after")
    def require_id_or_name(self):
        has_account_id = bool(self.student_account_id and self.student_account_id.strip())
        has_name = bool(self.student_name and self.student_name.strip())

        if not has_account_id and not has_name:
            raise ValueError("학생 ID 또는 이름 중 하나는 입력해야 합니다.")

        if self.student_account_id:
            self.student_account_id = self.student_account_id.strip()

        if self.student_name:
            self.student_name = self.student_name.strip()

        return self


class StudentResponse(BaseModel):
    id: int
    student_account_id: str
    student_name: str
    created_at: datetime

    class Config:
        from_attributes = True
        #객체에서 값을 꺼내서 응답 json으로 바굴수 있게 해준다. 
