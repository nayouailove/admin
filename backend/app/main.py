from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.company import router as company_router
from app.config import get_cors_origins
from app.routers.student import router as students_router


app = FastAPI(title="학생 채팅 관리자 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(company_router)
app.include_router(students_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}