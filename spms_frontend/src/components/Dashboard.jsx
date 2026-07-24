import AdminDashboard from "./AdminDashboard";
import FacultyDashboard from "./FacultyDashboard";

export default function Dashboard({ user }) {
  if (!user) return null;
  
  if (user.role === "admin") {
    return <AdminDashboard user={user} />;
  }
  
  if (user.role === "faculty") {
    return <FacultyDashboard user={user} />;
  }

  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
      <h2>Dashboard Access Restricted</h2>
      <p>Your role ({user.role}) does not have a dedicated staff dashboard view.</p>
    </div>
  );
}
