import "./ui.css";

export default function StatCard({ icon, label, value, trend, gradient = "primary", delay = 0 }) {
  return (
    <div className={`ui-stat-card gradient-${gradient} animate-in`} style={{ animationDelay: `${delay}ms` }}>
      <div className="ui-stat-icon">{icon}</div>
      <div className="ui-stat-body">
        <span className="ui-stat-label">{label}</span>
        <span className="ui-stat-value">{value}</span>
        {trend && (
          <span className={`ui-stat-trend ${trend.positive ? "up" : "down"}`}>
            {trend.positive ? "↑" : "↓"} {trend.text}
          </span>
        )}
      </div>
    </div>
  );
}
