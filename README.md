# 학생 채팅 관리자 페이지

선생님이 담당 학생 계정을 등록하고, 등록된 학생의 기존 채팅 목록으로 이동할 수 있는 관리자 페이지입니다.

## 핵심 기능

1. 회사 관리자가 선생님 계정 생성
- 선생님 (id, 이름)을 등록합니다. 
- 선생님 관리자 계정의 비밀번호 초기값은 0000입니다. 
- 삭제 버튼을 누르면 연결된 학생 목록까지 모두 삭제됩니다. 

2. 선생님 - 학생 관리

- 학생 ID 또는 학생 이름으로 학생을 등록할 수 있습니다.
- 등록된 학생 목록에서 학생 수와 등록 일시를 확인할 수 있습니다. 
- 학생 이름 또는 이동 아이콘을 누르면 기존 서비스의 채팅 목록 페이지로 이동합니다.
- 잘못 등록한 학생은 삭제할 수 있습니다.
- 학생 목록은 한 페이지에 7명씩 보여주며 페이지 이동이 가능합니다.

- 선생님 계정에 초기 설정된 비밀번호를 수정할 수 있습니다. 


## 화면 흐름

1. https://admin.telliot.cyou 로그인 접속
2. 
- 관리자 : 선생님을 등록할 수 있습니다. 
- 선생님 계정 : 학생 등록 페이지 / 학생 채팅 목록 이동 / 비밀번호 변경


채팅 목록 이동 주소는 아래 형식을 사용합니다.

```text
https://edu.telliot.co.kr/device-chat-list/{학생ID}
```

## 로그인 처리 방식

기존 로그인방식과 연동되는 것이 아니라 선생님이 학생을 관리하기 위한 페이지. 
따라서
선생님계정은 실제로 서비스에서 사용 불가, 
임시로 코드에 넣어둔 seed데이터로 확인함(실사용 시 api요청 필요)


## 데이터 구조

현재는 `users` 테이블과 `teacher_students` 테이블을 사용합니다.

`users` 테이블은 실제 계정 목록입니다.

```text
학생 계정
선생님 계정 
회사 관리자 계정
(role로 구분)
```

`teacher_students` 테이블은 선생님이 어떤 학생을 등록했는지 저장하는 연결 테이블입니다.

```text
teacher01 선생님
  -> test10 학생 등록
  -> test100 학생 등록
```

## 사용 기술

- Frontend: React, Vite
- Backend: FastAPI
- Database: PostgreSQL
- Local Dev: Docker Compose
- Deploy Plan: AWS RDS, ECR, ECS Fargate, ALB, S3, CloudFront, Route 53, GitHub Actions

## 로컬 실행

```powershell
docker compose up --build
```

실행 후 접속 주소:

```text
프론트엔드: http://localhost:5173
백엔드 API 문서: http://localhost:8000/docs
```


## 배포

1. 로컬에서 Docker Compose로 전체 실행 확인
2. GitHub에 코드 업로드
3. RDS PostgreSQL 생성
4. FastAPI Docker 이미지를 ECR에 업로드
5. ECS Fargate와 ALB로 백엔드 배포
6. React 빌드 파일을 S3와 CloudFront로 배포
7. 필요하면 Route 53으로 도메인 연결
8. 마지막에 GitHub Actions로 자동 배포 구성