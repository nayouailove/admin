import { useEffect, useState } from "react";

import { clearToken, fetchMe, getStoredToken } from "./api";
import AppShell from "./components/AppShell";
import LoginView from "./components/LoginView";
import CompanyAdminView from "./pages/CompanyAdminView";
import GuideView from "./pages/GuideView";
import PasswordChangeView from "./pages/PasswordChangeView";
import TeacherAdminView from "./pages/TeacherAdminView";


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
        <CompanyAdminView />
      )}

      {activeTab === "students" && user.role === "teacher" && (
        <TeacherAdminView
          user={user}/>
      )}

      {activeTab === "password" && user.role === "teacher" && (
        <PasswordChangeView />
      )}

      {activeTab === "guide" && user.role === "teacher" && <GuideView />}
    </AppShell>
  );
}

export default App;
