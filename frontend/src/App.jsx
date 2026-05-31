import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createStudent,
  deleteStudent,
  fetchMe,
  fetchStudents,
} from "./api";
import logo from "./assets/logo.png";

const CHAT_BASE_URL = import.meta.env.VITE_CHAT_BASE_URL;
const PAGE_SIZE = 7;

function App() {
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentAccountId, setStudentAccountId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const studentCount = useMemo(() => students.length, [students]);
  const totalPages = Math.max(1, Math.ceil(studentCount / PAGE_SIZE));
  const visibleStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return students.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, students]);

  async function loadPageData() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [me, studentList] = await Promise.all([
        fetchMe(),
        fetchStudents(),
      ]);

      setTeacher(me);
      setStudents(studentList);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedAccountId = studentAccountId.trim();
    const trimmedName = studentName.trim();

    if (!trimmedAccountId && !trimmedName) {
      setErrorMessage("학생 ID 또는 이름 중 하나는 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const newStudent = await createStudent({
        student_account_id: trimmedAccountId || null,
        student_name: trimmedName || null,
      });

      setStudents((currentStudents) => [newStudent, ...currentStudents]);
      setCurrentPage(1);
      setStudentAccountId("");
      setStudentName("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(studentId) {
    setErrorMessage("");

    try {
      await deleteStudent(studentId);
      setStudents((currentStudents) =>
        currentStudents.filter((student) => student.id !== studentId)
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function openChatList(studentAccountId) {
    if (!studentAccountId) {
      setErrorMessage("학생 ID가 없어 채팅 목록을 열 수 없습니다.");
      return;
    }

    window.open(`${CHAT_BASE_URL}/${studentAccountId}`, "_blank");
  }

  if (isLoading) {
    return <main className="page">불러오는 중...</main>;
  }

  return (
    <main className="page">
      <header className="appHeader">
        <div className="titleGroup">
          <img className="brandLogo" src={logo} alt="서비스 로고" />
          <h1>학생 관리</h1>
        </div>
      </header>

      <section className="teacherSummary">
        <div>
          <p className="eyebrow">현재 선생님</p>
          <p className="teacherMessage">
            <strong>{teacher?.display_name}</strong> 님의 페이지입니다.
          </p>
        </div>
        <p className="studentCountText">등록학생 {studentCount}명</p>
      </section>

      <form className="form" onSubmit={handleSubmit}>
        <input
          value={studentAccountId}
          onChange={(event) => setStudentAccountId(event.target.value)}
          placeholder="학생 ID"
        />
        <input
          value={studentName}
          onChange={(event) => setStudentName(event.target.value)}
          placeholder="학생 이름"
        />
        <button type="submit" disabled={isSubmitting}>
          <Plus size={18} />
          등록
        </button>
      </form>

      {errorMessage && (
        <div className="error" role="alert">
          {errorMessage}
        </div>
      )}

      <section className="list">
        {students.length === 0 ? (
          <p className="empty">아직 등록된 학생이 없습니다.</p>
        ) : (
          visibleStudents.map((student) => (
            <article className="studentRow" key={student.id}>
              <button
                className="studentMain"
                type="button"
                onClick={() => openChatList(student.student_account_id)}
                disabled={!student.student_account_id}
              >
                <span>{student.student_name || "이름 미등록"}</span>
                <small>{student.student_account_id || "ID 미등록"}</small>
              </button>

              <button
                className="iconButton"
                type="button"
                onClick={() => openChatList(student.student_account_id)}
                title="채팅 목록 열기"
                disabled={!student.student_account_id}
              >
                <ExternalLink size={18} />
              </button>

              <button
                className="iconButton danger"
                type="button"
                onClick={() => handleDelete(student.id)}
                title="학생 삭제"
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))
        )}
      </section>

      {studentCount > PAGE_SIZE && (
        <nav className="pagination" aria-label="학생 목록 페이지 이동">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                className={page === currentPage ? "activePage" : ""}
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </nav>
      )}
    </main>
  );
}

export default App;
