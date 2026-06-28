import { ExternalLink, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { bulkCreateStudents, createStudent, deleteStudent, fetchStudents } from "../api";
import { formatDate } from "../utils";

const CHAT_BASE_URL = import.meta.env.VITE_CHAT_BASE_URL;
const PAGE_SIZE = 7;

function TeacherAdminView({ user }) {
  const [students, setStudents] = useState([]);
  const [studentAccountId, setStudentAccountId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState("register");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [idColumn, setIdColumn] = useState("");
  const [nameColumn, setNameColumn] = useState("");
  const [previewStudents, setPreviewStudents] = useState([]);
  const [bulkResult, setBulkResult] = useState([]);
  const [modalStep, setModalStep] = useState("upload");
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const filteredStudents = useMemo(() => {
    if (mode !== "search") return students;
    const idQuery = studentAccountId.toLowerCase();  //소문자로 변환
    const nameQuery = studentName.toLowerCase();
    return students.filter((s) => {
      const matchId = !idQuery || s.student_account_id.toLowerCase().includes(idQuery);
      const matchName = !nameQuery || s.student_name.toLowerCase().includes(nameQuery);
      return matchId && matchName;
    });
  }, [mode, students, studentAccountId, studentName]);

  const studentCount = useMemo(() => students.length, [students]);
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const visibleStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredStudents]);

  async function loadStudents() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const studentList = await fetchStudents();
      setStudents(studentList);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function switchMode(newMode) {
    setMode(newMode);
    setStudentAccountId("");
    setStudentName("");
    setCurrentPage(1);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedAccountId = studentAccountId.trim();
    const trimmedName = studentName.trim();
    if (!trimmedAccountId || !trimmedName) {
      setErrorMessage("학생 ID와 이름을 모두 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const newStudent = await createStudent({
        student_account_id: trimmedAccountId,
        student_name: trimmedName,
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

  function openChatList(studentAccountIdToOpen) {
    if (!studentAccountIdToOpen) {
      setErrorMessage("학생 ID가 없어 채팅 목록을 열 수 없습니다.");
      return;
    }
    window.open(`${CHAT_BASE_URL}/${studentAccountIdToOpen}`, "_blank");
  }

  function openModal() {
    setIsModalOpen(true);
    setModalStep("upload");
    setParsedHeaders([]);
    setParsedRows([]);
    setIdColumn("");
    setNameColumn("");
    setPreviewStudents([]);
    setBulkResult([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  async function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const XLSX = await import("xlsx");
    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = e.target.result;
      const workbook = XLSX.read(buffer, { type: "array" }); //바이너리 파일을 워크북 객체로 변환
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet); //시트를 [{열이름: 값}, ...] 배열로 변환
      if (rows.length === 0) return;
      const headers = Object.keys(rows[0]).filter((h) => h && !h.startsWith("__"));
      setParsedHeaders(headers);
      setParsedRows(rows);
      setIdColumn(headers[0]);
      setNameColumn(headers[1] ?? headers[0]);
    };
    reader.readAsArrayBuffer(file);
  }

  function handleGoToPreview() {  //열 선택후 미리보기 생성
    const existingIds = new Set(students.map((s) => s.student_account_id));

    const candidates = parsedRows
      .map((row) => ({
        accountId: String(row[idColumn] ?? "").trim(), //idColumn:사용자가 드롭다운에서 선택한 열 이름만 꺼냄.
        name: String(row[nameColumn] ?? "").trim(),
      }))
      .filter((s) => s.accountId || s.name);  // 둘 다 완전히 빈 행은 의미 없는 줄이라 제외

    const idCounts = {};
    candidates.forEach((s) => {
      if (s.accountId) idCounts[s.accountId] = (idCounts[s.accountId] ?? 0) + 1;
    });

    const preview = candidates.map((s) => {
      let reason = "";
      if (!s.accountId) reason = "학생 ID 없음";
      else if (!s.name) reason = "이름 없음";
      else if (existingIds.has(s.accountId)) reason = "이미 등록된 학생";
      else if (idCounts[s.accountId] > 1) reason = "파일 내 중복 ID";

      return {
        accountId: s.accountId,
        name: s.name,
        excluded: Boolean(reason),
        reason,
      };
    });

    setPreviewStudents(preview);
    setModalStep("preview");
  }

  function toggleExclude(index) { 
    setPreviewStudents((prev) =>
      prev.map((s, i) => (i === index ? { ...s, excluded: !s.excluded } : s))
    );
  } //map : 새 배열을 만드는 방식으로 등록 전 학생 제외

  async function handleBulkSubmit() {
    const toSubmit = previewStudents
      .filter((s) => !s.excluded)
      .map((s) => ({ student_account_id: s.accountId, student_name: s.name }));

    setIsBulkSubmitting(true);
    try {
      const result = await bulkCreateStudents(toSubmit);

      const resultMap = {};
      result.created.forEach((s) => {
        resultMap[s.student_account_id] = { status: "success" };
      });
      result.failed.forEach((s) => {
        resultMap[s.student_account_id] = { status: "failed", reason: s.reason };
      });

      const mergedResult = toSubmit.map((s) => {
        const r = resultMap[s.student_account_id];
        return {
          accountId: s.student_account_id,
          name: s.student_name,
          status: r?.status ?? "failed",
          reason: r?.reason ?? "처리되지 않음",
        };
      });

      setBulkResult(mergedResult);
      setModalStep("result");

      if (result.created.length > 0) {
        setStudents((prev) => [...result.created, ...prev]);
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsBulkSubmitting(false);
    }
  }

  return (
    <div className="workspace">
      <header className="workspaceHeader">
        <div>
          <p className="eyebrow">현재 선생님</p>
          <h1>{user.name} 님의 페이지입니다.</h1>
        </div>
        <p className="summaryText">등록 학생 {studentCount}명</p>
      </header>

      <div className="modeLinks">
        <button type="button" className="linkButton" onClick={openModal}>
          일괄 등록
        </button>
        <span className="modeDivider">|</span>
        {mode === "register" ? (
          <button type="button" className="linkButton" onClick={() => switchMode("search")}>
            검색
          </button>
        ) : (
          <button type="button" className="linkButton" onClick={() => switchMode("register")}>
            등록하기
          </button>
        )}
      </div>

      {mode === "register" ? (
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
      ) : (
        <div className="form searchForm">
          <div className="searchInputWrapper">
            <Search size={16} className="searchIcon" />
            <input
              value={studentAccountId}
              onChange={(event) => {
                setStudentAccountId(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="ID로 검색"
            />
          </div>
          <div className="searchInputWrapper">
            <Search size={16} className="searchIcon" />
            <input
              value={studentName}
              onChange={(event) => {
                setStudentName(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="이름으로 검색"
            />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="error" role="alert">
          {errorMessage}
        </div>
      )}

      <section className="dataList">
        {isLoading ? (
          <p className="empty">불러오는 중...</p>
        ) : visibleStudents.length === 0 ? (
          <p className="empty">
            {mode === "search" ? "검색 결과가 없습니다." : "아직 등록된 학생이 없습니다."}
          </p>
        ) : (
          visibleStudents.map((student) => (
            <article className="dataRow studentRow" key={student.id}>
              <button
                className="studentMain"
                type="button"
                onClick={() => openChatList(student.student_account_id)}
                disabled={!student.student_account_id}
              >
                <span>{student.student_name || "이름 미등록"}</span>
                <small>{student.student_account_id ? `@${student.student_account_id}` : "ID 미등록"}</small>
              </button>
              <span className="dateText">{formatDate(student.created_at)}</span>
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

      {filteredStudents.length > PAGE_SIZE && (
        <nav className="pagination" aria-label="학생 목록 페이지 이동">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              className={page === currentPage ? "activePage" : ""}
              type="button"
              key={page}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </nav>
      )}

      {isModalOpen && (
        <div className="modalOverlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>일괄 등록</h2>
              <button type="button" className="iconButton" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            {modalStep === "upload" && (
              <div className="modalBody">
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <div className="templateHint">
                  <p>엑셀 파일이 없다면 양식을 받아 입력 후 업로드해주세요.</p>
                  <a className="linkButton" href="/templates/학생일괄등록양식.xlsx" download>
                    다운로드
                  </a>
                </div>
                {parsedHeaders.length > 0 && (
                  <>
                    <label className="columnLabel">
                      학생 ID 열 선택
                      <select value={idColumn} onChange={(e) => setIdColumn(e.target.value)}>
                        {parsedHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </label>
                    <label className="columnLabel">
                      학생 이름 열 선택
                      <select value={nameColumn} onChange={(e) => setNameColumn(e.target.value)}>
                        {parsedHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </label>
                    <button type="button" onClick={handleGoToPreview}>
                      다음
                    </button>
                  </>
                )}
              </div>
            )}

            {modalStep === "preview" && (
              <div className="modalBody">
                <p className="previewCount">
                  {previewStudents.filter((s) => !s.excluded).length}명 등록 예정
                </p>
                <ul className="previewList">
                  {previewStudents.map((s, i) => (
                    <li key={i} className={s.excluded ? "excluded" : ""}>
                      <span className="previewName">{s.name || "이름 없음"}</span>
                      <span className="previewId">
                        {s.accountId ? `@${s.accountId}` : "ID 없음"}
                        {s.reason && <small className="previewReason"> · {s.reason}</small>}
                      </span>
                      <button
                        type="button"
                        className="iconButton"
                        onClick={() => toggleExclude(i)}
                        title={s.excluded ? "포함" : "제외"}
                      >
                        <X size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={handleBulkSubmit} disabled={isBulkSubmitting}>
                  학생 등록
                </button>
              </div>
            )}

            {modalStep === "result" && (
              <div className="modalBody">
                <ul className="resultList">
                  {bulkResult.map((r, i) => (
                    <li key={i} className={`resultItem result-${r.status}`}>
                      <span className="resultIcon">
                        {r.status === "success" ? "✓" : "✗"}
                      </span>
                      <span className="resultName">{r.name}</span>
                      <span className="resultReason">
                        {r.status === "success" ? "등록 완료" : r.reason}
                      </span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={closeModal}>
                  닫기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherAdminView;
