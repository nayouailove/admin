import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { createTeacher, deleteTeacher, fetchTeachers } from "../api";

function CompanyAdminView({ formatDate }) {
  const [teachers, setTeachers] = useState([]);
  const [teacherAccountId, setTeacherAccountId] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadTeachers() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const teacherList = await fetchTeachers();
      setTeachers(teacherList);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const newTeacher = await createTeacher({
        teacher_account_id: teacherAccountId.trim(),
        teacher_name: teacherName.trim(),
      });

      setTeachers((currentTeachers) => [newTeacher, ...currentTeachers]);
      setTeacherAccountId("");
      setTeacherName("");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTeacher(teacherId) {
    setErrorMessage("");

    try {
      await deleteTeacher(teacherId);

      setTeachers((currentTeachers) =>
        currentTeachers.filter((teacher) => teacher.id !== teacherId)
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <div className="workspace">
      <header className="workspaceHeader">
        <div>
          <p className="eyebrow">회사 페이지</p>
          <h1>선생님 관리</h1>
        </div>
        <p className="summaryText">등록 선생님 {teachers.length}명</p>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        <input
          value={teacherAccountId}
          onChange={(event) => setTeacherAccountId(event.target.value)}
          placeholder="선생님 ID"
        />
        <input
          value={teacherName}
          onChange={(event) => setTeacherName(event.target.value)}
          placeholder="선생님 이름"
        />
        <button
          type="submit"
          disabled={
            isSubmitting || !teacherAccountId.trim() || !teacherName.trim()
          }
        >
          <Plus size={18} />
          등록
        </button>
      </form>

      {errorMessage && (
        <div className="error" role="alert">
          {errorMessage}
        </div>
      )}

      <section className="dataList">
        {isLoading ? (
          <p className="empty">불러오는 중...</p>
        ) : teachers.length === 0 ? (
          <p className="empty">아직 등록된 선생님이 없습니다.</p>
        ) : (
          teachers.map((teacher) => (
            <article className="dataRow teacherRow" key={teacher.account_id}>
              <div>
                <strong>{teacher.name}</strong>
                <small>{teacher.account_id}</small>
              </div>

              <span className="dateText">{formatDate(teacher.created_at)}</span>

              <button
                className="iconButton danger"
                type="button"
                onClick={() => handleDeleteTeacher(teacher.id)}
                title="선생님 삭제"
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default CompanyAdminView;
