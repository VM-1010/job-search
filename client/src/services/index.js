import api from './api';

export const authService = {
  // Register seeker
  registerSeeker: async (data) => {
    const response = await api.post('/auth/register/seeker', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.seeker || response.data.user));
    }
    return response.data;
  },

  // Register recruiter
  registerRecruiter: async (data) => {
    const response = await api.post('/auth/register/recruiter', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.recruiter));
    }
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      const user = response.data.seeker || response.data.recruiter;
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update seeker profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

export const jobService = {
  // Get all jobs with filters
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // Get job by ID
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Create job (recruiter only)
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Get my jobs (recruiter only)
  getMyJobs: async () => {
    const response = await api.get('/jobs/my-jobs');
    return response.data;
  },

  // Update job
  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete job
  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Close job
  closeJob: async (id) => {
    const response = await api.put(`/jobs/${id}/close`);
    return response.data;
  },

  // Reopen job
  reopenJob: async (id) => {
    const response = await api.put(`/jobs/${id}/reopen`);
    return response.data;
  },
};

export const applicationService = {
  // Apply to job
  applyToJob: async (applicationData) => {
    const response = await api.post('/applications', applicationData);
    return response.data;
  },

  // Get my applications (seeker)
  getMyApplications: async () => {
    const response = await api.get('/applications/my-applications');
    return response.data;
  },

  // Get applicants for a job (recruiter)
  getApplicantsForJob: async (jobId) => {
    const response = await api.get(`/applications/job/${jobId}`);
    return response.data;
  },

  // Update application status
  updateApplicationStatus: async (id, status) => {
    const response = await api.put(`/applications/${id}/status`, { status });
    return response.data;
  },
};

export const userService = {
  // Get full profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update headline
  updateHeadline: async (headline) => {
    const response = await api.put('/users/profile/headline', { headline });
    return response.data;
  },

  // Update about
  updateAbout: async (about) => {
    const response = await api.put('/users/profile/about', { about });
    return response.data;
  },

  // Update location
  updateLocation: async (location) => {
    const response = await api.put('/users/profile/location', { location });
    return response.data;
  },

  // Add education
  addEducation: async (education) => {
    const response = await api.post('/users/profile/education', education);
    return response.data;
  },

  // Update education
  updateEducation: async (id, education) => {
    const response = await api.put(`/users/profile/education/${id}`, education);
    return response.data;
  },

  // Delete education
  deleteEducation: async (id) => {
    const response = await api.delete(`/users/profile/education/${id}`);
    return response.data;
  },

  // Add experience
  addExperience: async (experience) => {
    const response = await api.post('/users/profile/experience', experience);
    return response.data;
  },

  // Update experience
  updateExperience: async (id, experience) => {
    const response = await api.put(`/users/profile/experience/${id}`, experience);
    return response.data;
  },

  // Delete experience
  deleteExperience: async (id) => {
    const response = await api.delete(`/users/profile/experience/${id}`);
    return response.data;
  },

  // Add skill
  addSkill: async (skill) => {
    const response = await api.post('/users/profile/skills', skill);
    return response.data;
  },

  // Delete skill
  deleteSkill: async (id) => {
    const response = await api.delete(`/users/profile/skills/${id}`);
    return response.data;
  },

  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/dashboard/user');
    return response.data;
  },
};

export const companyService = {
  // Get all companies
  getCompanies: async () => {
    const response = await api.get('/companies');
    return response.data;
  },

  // Get company by ID
  getCompany: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  // Create company
  createCompany: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  // Update company
  updateCompany: async (id, companyData) => {
    const response = await api.put(`/companies/${id}`, companyData);
    return response.data;
  },

  // Get company jobs
  getCompanyJobs: async (id) => {
    const response = await api.get(`/companies/${id}/jobs`);
    return response.data;
  },
};
