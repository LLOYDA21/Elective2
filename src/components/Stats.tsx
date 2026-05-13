type StatsProps = {
  pending: number;
  completed: number;
  subjects: number;
  hours: number;
  totalTasks: number;
};

export default function Stats({ pending, completed, subjects, hours, totalTasks }: StatsProps) {
  return (
    <div className="dashboard-card">
      <h2>📊 Statistics & Progress</h2>

      <div className="stats-section">
        <div className="stat-box">
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>

        <div className="stat-box">
          <h3>Completed</h3>
          <p>{completed}</p>
        </div>

        <div className="stat-box">
          <h3>Pending</h3>
          <p>{pending}</p>
        </div>

        <div className="stat-box">
          <h3>Total Study Hours</h3>
          <p>{hours}h</p>
        </div>

        <div className="stat-box">
          <h3>Subjects</h3>
          <p>{subjects}</p>
        </div>
      </div>
    </div>
  );
}