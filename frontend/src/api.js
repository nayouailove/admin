const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_STORAGE_KEY = "teacherAdminAccessToken";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const detail = errorData?.detail;
    throw new Error(
      typeof detail === "string" ? detail : "요청에 실패했습니다."
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function login(accountId, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      account_id: accountId,
      password,
    }),
  });

  storeToken(data.access_token);
  return data.user;
}

export function fetchMe() {
  return request("/auth/me");
}

export function changePassword(passwordData) {
  return request("/auth/password", {
    method: "PATCH",
    body: JSON.stringify(passwordData),
  });
}

export function fetchTeachers() {
  return request("/company/teachers");
}

export function createTeacher(teacher) {
  return request("/company/teachers", {
    method: "POST",
    body: JSON.stringify(teacher),
  });
}

export function deleteTeacher(teacherId) {
  return request(`/company/teachers/${teacherId}`, {
    method: "DELETE",
  });
}

export function fetchStudents() {
  return request("/students");
}

export function createStudent(student) {
  return request("/students", {
    method: "POST",
    body: JSON.stringify(student),
  });
}

export function deleteStudent(studentId) {
  return request(`/students/${studentId}`, {
    method: "DELETE",
  });
}

export function bulkCreateStudents(students) {
  return request("/students/bulk", {
    method: "POST",
    body: JSON.stringify({ students }),
  });
}

export function resetTeacherPassword(teacherId) {
  return request(`/company/teachers/${teacherId}/reset-password`, { method: "PATCH" });
}