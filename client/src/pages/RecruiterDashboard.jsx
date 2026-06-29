import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService, applicationService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const jobsData = await jobService.getMyJobs().catch(() => []);
      const jobsList = Array.isArray(jobsData) ? jobsData : [];

      let totalApps = 0;
      for (const job of jobsList) {
        try {
          const apps = await applicationService.getApplicantsForJob(job._id).catch(() => []);
          totalApps += Array.isArray(apps) ? apps.length : 0;
        } catch (err) {
          // Ignore individual job errors
        }
      }

      setStats({
        totalJobs: jobsList.length,
        activeJobs: jobsList.filter((j) => j.isOpen).length,
        totalApplications: totalApps,
      });

      setJobs(jobsList.slice(0, 5));
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
      <h1>Welcome, {user?.name || 'Recruiter'}!</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalJobs}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeJobs}</div>
          <div className="stat-label">Active Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalApplications}</div>
          <div className="stat-label">Applications</div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Job Postings</h2>
          <Link to="/jobs/post" className="btn-primary">
            Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <p>You haven't posted any jobs yet.</p>
            <Link to="/jobs/post" className="btn-primary">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          job.isOpen ? 'status-open' : 'status-closed'
                        }`}
                      >
                        {job.isOpen ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td>{job.location || '-'}</td>
                    <td>{job.employmentType || '-'}</td>
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
          <Link to="/jobs/post" className="action-card">
            <span className="action-icon">➕</span>
            <span>Post Job</span>
          </Link>
          <Link to="/applications/recruiter" className="action-card">
            <span className="action-icon">📋</span>
            <span>View Applications</span>
          </Link>
          <Link to="/jobs/my-jobs" className="action-card">
            <span className="action-icon">💼</span>
            <span>Manage Jobs</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
