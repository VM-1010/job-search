import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobService, applicationService } from '../../services';
import './RecruiterApplications.css';

const RecruiterApplications = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      fetchApplications();
    }
  }, [selectedJob]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobService.getMyJobs();
      setJobs(Array.isArray(data) ? data : []);
      if (data.length > 0 && !selectedJob) {
        setSelectedJob(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    if (!selectedJob) return;
    
    setLoadingApps(true);
    try {
      const data = await applicationService.getApplicantsForJob(selectedJob);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleStatusUpdate = async (appId, status) => {
    try {
      await applicationService.updateApplicationStatus(appId, status);
      setApplications((prev) =>
        prev.map((app) =>
          app._id === appId ? { ...app, status } : app
        )
      );
      alert(`Application ${status}`);
    } catch (err) {
      alert('Failed to update application status');
    }
  };

  const currentJob = jobs.find((j) => j._id === selectedJob);

  return (
    <div className="recruiter-apps-container">
      <h1>Manage Applications</h1>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="no-jobs">
          <p>You haven't posted any jobs yet.</p>
          <Link to="/jobs/post" className="btn-primary">
            Post Your First Job
          </Link>
        </div>
      ) : (
        <>
          <div className="job-selector">
            <label>Select Job:</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {currentJob && (
            <div className="job-info">
              <h2>{currentJob.title}</h2>
              <p>
                {applications.length} application
                {applications.length !== 1 ? 's' : ''} received
              </p>
            </div>
          )}

          {loadingApps ? (
            <div className="loading">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="no-applications">
              <p>No applications for this job yet.</p>
            </div>
          ) : (
            <div className="applications-table-full">
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Cover Letter</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <strong>
                          {app.applicant?.name || app.user?.name || 'Unknown'}
                        </strong>
                      </td>
                      <td>{app.applicant?.email || app.user?.email || '-'}</td>
                      <td>
                        <span
                          className={`status-badge status-${
                            app.status || 'pending'
                          }`}
                        >
                          {app.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        {app.appliedAt
                          ? new Date(app.appliedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="cover-letter-cell">
                        {app.coverLetter ? (
                          <div className="cover-letter-preview">
                            {app.coverLetter.substring(0, 100)}...
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="actions-cell">
                        {(!app.status || app.status === 'pending') && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, 'accepted')
                              }
                              className="btn-accept"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(app._id, 'rejected')
                              }
                              className="btn-reject"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === 'accepted' && (
                          <span className="accepted-text">✓ Accepted</span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="rejected-text">✗ Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecruiterApplications;
