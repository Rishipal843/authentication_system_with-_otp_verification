import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        
        {/* User Avatar & Greeting */}
        {user?.profileImage && (
          <img src={user.profileImage} alt="Profile" className="dashboard-avatar" />
        )}
        
        <h1>Dashboard</h1>
        <p className="welcome-text">Welcome, <strong>{user?.name || "User"}</strong>!</p>

        {/* User Details Box */}
        <div className="user-details">
          <div className="detail-row">
            <span className="label">Email:</span>
            <span className="value">{user?.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Auth Provider:</span>
            <span className="value">{user?.authProvider || "Local"}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>

      </div>
    </div>
  );
};

export default Dashboard;