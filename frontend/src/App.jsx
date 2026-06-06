import { useEffect, useState } from "react";

import { clearToken, fetchMe, getStoredToken } from "./api";
import AppShell from "./components/AppShell";
import LoginView from "./components/LoginView";
import CompanyAdminView from "./pages/CompanyAdminView";
import PasswordChangeView from "./pages/PasswordChangeView";
import TeacherAdminView from "./pages/TeacherAdminView";

const CHAT_BASE_URL = import.meta.env.VITE_CHAT_BASE_URL;
const PAGE_SIZE = 7;

function formatDate(dateText) {
  if (!dateText) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateText));
}

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("students");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!getStoredToken()) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const currentUser = await fetchMe();
        setUser(currentUser);
        setActiveTab(
          currentUser.role === "company_admin" ? "teachers" : "students"
        );
      } catch {
        clearToken();
      } finally {
        setIsCheckingSession(false);
      }
    }

    restoreSession();
  }, []);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setActiveTab(loggedInUser.role === "company_admin" ? "teachers" : "students");
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setActiveTab("students");
  }

  if (isCheckingSession) {
    return <main className="loadingPage">불러오는 중...</main>;
  }

  if (!user) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <AppShell
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {activeTab === "teachers" && user.role === "company_admin" && (
        <CompanyAdminView formatDate={formatDate} />
      )}

      {activeTab === "students" && user.role === "teacher" && (
        <TeacherAdminView
          user={user}
          chatBaseUrl={CHAT_BASE_URL}
          formatDate={formatDate}
          pageSize={PAGE_SIZE}
        />
      )}

      {activeTab === "password" && user.role === "teacher" && (
        <PasswordChangeView />
      )}
    </AppShell>
  );
}

export default App;
