export default function Settings() {
  return (
    <div className="dashboard-card">
      <h2>⚙ Settings</h2>

      <div className="settings-section">
        <div className="setting-item">
          <label>Dark Mode</label>
          <input type="checkbox" />
        </div>

        <div className="setting-item">
          <label>Email Notifications</label>
          <input type="checkbox" />
        </div>

        <div className="setting-item">
          <label>Study Reminders</label>
          <input type="checkbox" />
        </div>
      </div>
    </div>
  );
}