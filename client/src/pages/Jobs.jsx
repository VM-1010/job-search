import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    employmentType: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, [filters, page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 10 };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });

      const data = await jobService.getJobs(params);
      if (data.jobs) {
        setJobs(data.jobs);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Find Your Dream Job</h1>
        <p>Browse through thousands of job opportunities</p>
      </div>

      <form onSubmit={handleSearch} className="jobs-filters">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by title or company"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="Location"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <select
            name="employmentType"
            value={filters.employmentType}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Employment Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <button type="submit" className="btn-search">
          Search
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading jobs...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No jobs found matching your criteria</p>
        </div>
      ) : (
        <>
          <div className="jobs-list">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="job-card"
                onClick={() => handleJobClick(job._id)}
              >
                <div className="job-header">
                  <h3>{job.title}</h3>
                  {job.company && (
                    <span className="job-company">{job.company.name}</span>
                  )}
                </div>

                <div className="job-details">
                  {job.location && (
                    <span className="job-location">{job.location}</span>
                  )}
                  {job.employmentType && (
                    <span className="job-type">{job.employmentType}</span>
                  )}
                  {job.salary && (
                    <span className="job-salary">{job.salary}</span>
                  )}
                </div>

                <div className="job-description-preview">
                  {job.description?.substring(0, 150)}...
                </div>

                <div className="job-tags">
                  {job.skills?.slice(0, 3).map((skill, index) => (
                    <span key={index} className="job-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-page"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;
