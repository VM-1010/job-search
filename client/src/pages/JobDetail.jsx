import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService, applicationService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import './JobDetail.css';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isSeeker } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobById(id);
      setJob(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated || !isSeeker) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      await applicationService.applyToJob({
        jobId: id,
        coverLetter,
      });
      setApplied(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading job details...</div>;
  }

  if (error || !job) {
    return <div className="error">{error || 'Job not found'}</div>;
  }

  return (
    <div className="job-detail-container">
      <button onClick={() => navigate(-1)} className="btn-back">
        ← Back to Jobs
      </button>

      <div className="job-detail-card">
        <div className="job-detail-header">
          <div>
            <h1>{job.title}</h1>
            {job.company && (
              <p className="job-company-name">{job.company.name}</p>
            )}
          </div>
          {!job.isOpen && (
            <span className="status-closed">Closed</span>
          )}
        </div>

        <div className="job-meta">
          {job.location && (
            <div className="meta-item">
              <span className="meta-label">Location</span>
              <span className="meta-value">{job.location}</span>
            </div>
          )}
          {job.employmentType && (
            <div className="meta-item">
              <span className="meta-label">Employment Type</span>
              <span className="meta-value">{job.employmentType}</span>
            </div>
          )}
          {job.salary && (
            <div className="meta-item">
              <span className="meta-label">Salary</span>
              <span className="meta-value">{job.salary}</span>
            </div>
          )}
          {job.experienceLevel && (
            <div className="meta-item">
              <span className="meta-label">Experience</span>
              <span className="meta-value">{job.experienceLevel}</span>
            </div>
          )}
        </div>

        <div className="job-section">
          <h2>Description</h2>
          <p className="job-description">{job.description}</p>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className="job-section">
            <h2>Requirements</h2>
            <ul className="requirements-list">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {job.skills && job.skills.length > 0 && (
          <div className="job-section">
            <h2>Skills</h2>
            <div className="skills-tags">
              {job.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.isOpen && isSeeker && !applied && (
          <div className="apply-section">
            <h2>Apply for this Position</h2>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a brief cover letter explaining why you're a good fit..."
              rows="5"
              className="cover-letter-input"
            />
            <button
              onClick={handleApply}
              disabled={applying}
              className="btn-apply"
            >
              {applying ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        )}

        {applied && (
          <div className="applied-message">
            ✓ Application submitted successfully!
          </div>
        )}

        {job.isOpen && !isSeeker && (
          <div className="login-prompt">
            <p>Please log in as a job seeker to apply for this position.</p>
            <button onClick={() => navigate('/login')} className="btn-login">
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;
