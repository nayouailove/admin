const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "요청에 실패했습니다.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function fetchMe() {
  return request("/me");
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