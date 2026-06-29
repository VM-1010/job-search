import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services';
import './Applications.css';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getMyApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <div className="loading">Loading applications...</div>;
  }

  return (
    <div className="applications-container">
      <h1>My Applications</h1>

      {error && <div className="error">{error}</div>}

      {applications.length === 0 ? (
        <div className="no-applications">
          <p>You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="btn-browse">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((app) => (
            <div key={app._id} className="application-card">
              <div className="app-header">
                <div>
                  <h3>{app.job?.title || 'Unknown Position'}</h3>
                  {app.job?.company && (
                    <span className="app-company">{app.job.company.name}</span>
                  )}
                </div>
                <span
                  className="app-status"
                  style={{ backgroundColor: getStatusColor(app.status) }}
                >
                  {app.status}
                </span>
              </div>

              <div className="app-details">
                {app.appliedAt && (
                  <span className="app-date">
                    Applied: {new Date(app.appliedAt).toLocaleDateString()}
                  </span>
                )}
                {app.job?.location && (
                  <span className="app-location">{app.job.location}</span>
                )}
              </div>

              {app.coverLetter && (
                <div className="app-cover-letter">
                  <strong>Cover Letter:</strong>
                  <p>{app.coverLetter}</p>
                </div>
              )}

              {app.status === 'accepted' && (
                <div className="app-accepted">
                  🎉 Congratulations! Your application has been accepted.
                </div>
              )}

              {app.status === 'rejected' && (
                <div className="app-rejected">
                  Your application was not selected for this position.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
