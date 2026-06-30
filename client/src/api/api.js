const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(method, path, getToken, body = null, isFormData = false) {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(err.message || 'Request failed'), { status: res.status });
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const syncUser = (getToken, role) => request('POST', '/api/auth/sync', getToken, { role });

// ─── User Dashboard ───────────────────────────────────────────────────────────
export const getDashboard = (getToken) => request('GET', '/api/dashboard', getToken);

// ─── Jobs ────────────────────────────────────────────────────────────────────
export function getJobs(getToken, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v !== undefined) params.set(k, v); });
  const qs = params.toString();
  return request('GET', `/api/jobs${qs ? '?' + qs : ''}`, getToken);
}
export const getJob = (getToken, id) => request('GET', `/api/jobs/${id}`, getToken);

// ─── Applications ─────────────────────────────────────────────────────────────
export const applyToJob    = (getToken, jobId) => request('POST',   '/api/applications',     getToken, { jobId });
export const getApplications   = (getToken)        => request('GET',    '/api/applications',     getToken);
export const deleteApplication = (getToken, id)    => request('DELETE', `/api/applications/${id}`, getToken);

// ─── User Profile ─────────────────────────────────────────────────────────────
export const getProfile    = (getToken)       => request('GET', '/api/profile', getToken);
export const updateProfile = (getToken, data) => request('PUT', '/api/profile', getToken, data);

export function uploadResume(getToken, file) {
  const formData = new FormData();
  formData.append('resume', file);
  return request('POST', '/api/upload/resume', getToken, formData, true);
}

// ─── Employer Dashboard ────────────────────────────────────────────────────────
export const getEmployerDashboard = (getToken) => request('GET', '/api/emp/dashboard', getToken);

// ─── Employer Profile ─────────────────────────────────────────────────────────
export const getEmployerProfile    = (getToken)       => request('GET', '/api/emp/profile', getToken);
export const updateEmployerProfile = (getToken, data) => request('PUT', '/api/emp/profile', getToken, data);

// ─── Employer Jobs ────────────────────────────────────────────────────────────
export const getEmployerJobs = (getToken)           => request('GET',    '/api/emp/jobs',      getToken);
export const createJob       = (getToken, data)     => request('POST',   '/api/emp/jobs',      getToken, data);
export const updateJob       = (getToken, id, data) => request('PUT',    `/api/emp/jobs/${id}`, getToken, data);
export const deleteJob       = (getToken, id)       => request('DELETE', `/api/emp/jobs/${id}`, getToken);

// ─── Employer Applications ────────────────────────────────────────────────────
export const getJobApplications      = (getToken, jobId)          => request('GET', `/api/emp/jobs/${jobId}/applications`, getToken);
export const updateApplicationStatus = (getToken, appId, status) => request('PUT', `/api/emp/applications/${appId}`,      getToken, { status });

// ─── Applicant Profile (employer view) ────────────────────────────────────────
export const getApplicantProfile = (getToken, userId) => request('GET', `/api/emp/profile/${userId}`, getToken);
