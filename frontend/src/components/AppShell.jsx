import { GraduationCap, KeyRound, LogOut, Users } from "lucide-react";

import logo from "../assets/logo.png";

function AppShell({ user, activeTab, onTabChange, onLogout, children }) {
  const tabs = [];

  if (user.role === "company_admin") {
    tabs.push({
      id: "teachers",
      label: "선생님 관리",
      icon: Users,
    });
  }

  if (user.role === "teacher") {
    tabs.push({
      id: "students",
      label: "학생 관리",
      icon: GraduationCap,
    });
    tabs.push({
      id: "password",
      label: "비밀번호 변경",
      icon: KeyRound,
    });
  }

  return (
    <main className="appLayout">
      <aside className="sidebar">
        <div className="sidebarBrand">
          <img className="sidebarLogo" src={logo} alt="서비스 로고" />
          <div>
            <strong>학생관리</strong>
            <span>{user.name} 님</span>
          </div>
        </div>

        <nav className="sideNav" aria-label="관리 메뉴">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                className={tab.id === activeTab ? "active" : ""}
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <button className="logoutButton" type="button" onClick={onLogout}>
          <LogOut size={18} />
          로그아웃
        </button>
      </aside>

      <section className="contentArea">{children}</section>
    </main>
  );
}

export default AppShell;
