from pydantic_settings import BaseSettings
#env 파일에서 설정값을 읽어오는 클래스. BaseSettings를 상속받아 필요한 설정값을 필드로 정의한다. 
# Config 클래스에서 env_file을 지정하여 .env 파일에서 설정값을 읽어오도록 한다. 
# settings 객체를 생성하여 애플리케이션 전체에서 사용할 수 있도록 한다.


class Settings(BaseSettings): #환경변수를 읽는 설정 클래스
    database_url: str
    dev_teacher_id: str
    dev_teacher_name: str

    class Config:
        env_file = ".env"


settings = Settings() #실제 설정 객체를 만든다
