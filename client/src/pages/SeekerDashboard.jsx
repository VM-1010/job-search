import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService, applicationService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardData, applications] = await Promise.all([
        userService.getDashboard().catch(() => ({})),
        applicationService.getMyApplications().catch(() => []),
      ]);

      const apps = Array.isArray(applications) ? applications : [];
      
      setStats({
        totalApplications: apps.length,
        pendingApplications: apps.filter((a) => a.status === 'pending').length,
        acceptedApplications: apps.filter((a) => a.status === 'accepted').length,
      });

      setRecentApplications(apps.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user?.name || 'Job Seeker'}!</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalApplications}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingApplications}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.acceptedApplications}</div>
          <div className="stat-label">Accepted</div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Applications</h2>
          <Link to="/applications" className="view-all">
            View All
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="empty-state">
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/jobs" className="btn-primary">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Date Applied</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.job?.title || 'Unknown'}</td>
                    <td>{app.job?.company?.name || '-'}</td>
                    <td>
                      <span className={`status-badge status-${app.status}`}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/jobs" className="action-card">
            <span className="action-icon">🔍</span>
            <span>Browse Jobs</span>
          </Link>
          <Link to="/profile" className="action-card">
            <span className="action-icon">👤</span>
            <span>Update Profile</span>
          </Link>
          <Link to="/applications" className="action-card">
            <span className="action-icon">📋</span>
            <span>View Applications</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SeekerDashboard;
