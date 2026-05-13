type SidebarProps = {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onLogout: () => void;
};

export default function Sidebar({ activeMenu, setActiveMenu, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div>
        <div className="logo-box">📘</div>

        <div className="menu-items">
          <button
            className={`menu-btn ${activeMenu === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveMenu("dashboard")}
          >
            🏠
          </button>

          <button
            className={`menu-btn ${activeMenu === "tasks" ? "active" : ""}`}
            onClick={() => setActiveMenu("tasks")}
          >
            📋
          </button>

          <button
            className={`menu-btn ${activeMenu === "calendar" ? "active" : ""}`}
            onClick={() => setActiveMenu("calendar")}
          >
            📅
          </button>

          <button
            className={`menu-btn ${activeMenu === "stats" ? "active" : ""}`}
            onClick={() => setActiveMenu("stats")}
          >
            📊
          </button>

          <button
            className={`menu-btn ${activeMenu === "ai" ? "active" : ""}`}
            onClick={() => setActiveMenu("ai")}
          >
            ✨
          </button>

          <button
            className={`menu-btn ${activeMenu === "settings" ? "active" : ""}`}
            onClick={() => setActiveMenu("settings")}
          >
            ⚙
          </button>
        </div>
      </div>

      <button className="menu-btn logout-btn" onClick={onLogout}>
        🚪
      </button>
    </aside>
  );
}