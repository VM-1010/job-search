import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService, companyService } from '../../services';
import './PostJob.css';

const PostJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid-level',
    salary: '',
    requirements: '',
    skills: '',
    companyId: '',
  });

  const fetchCompanies = async () => {
    try {
      const data = await companyService.getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load companies:', err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements
          .split('\n')
          .filter((r) => r.trim())
          .map((r) => r.trim()),
        skills: formData.skills
          .split(',')
          .filter((s) => s.trim())
          .map((s) => s.trim()),
      };

      await jobService.createJob(jobData);
      alert('Job posted successfully!');
      navigate('/dashboard/recruiter');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <h1>Post a New Job</h1>

      <form onSubmit={handleSubmit} className="post-job-form">
        <div className="form-group">
          <label htmlFor="title">Job Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Job Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
            placeholder="Describe the role, responsibilities, and what you're looking for..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA or Remote"
            />
          </div>

          <div className="form-group">
            <label htmlFor="employmentType">Employment Type</label>
            <select
              id="employmentType"
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="experienceLevel">Experience Level</label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
            >
              <option value="Entry-level">Entry-level</option>
              <option value="Mid-level">Mid-level</option>
              <option value="Senior-level">Senior-level</option>
              <option value="Executive">Executive</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salary Range</label>
            <input
              type="text"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., $80,000 - $120,000"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="requirements">Requirements (one per line)</label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows="4"
            placeholder="• 5+ years of experience&#10;• Bachelor's degree in Computer Science&#10;• Strong problem-solving skills"
          />
        </div>

        <div className="form-group">
          <label htmlFor="skills">Skills (comma-separated)</label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g., JavaScript, React, Node.js, Python"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJob;
