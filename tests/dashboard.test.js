import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import { getAuthHeaders } from './helpers/auth.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Dashboard API Integration Tests', () => {
  let seeker;
  let company;
  let recruiter;
  let job;
  let seekerHeaders;
  let recruiterHeaders;

  beforeEach(async () => {
    seeker = await factories.createSeeker();
    company = await factories.createCompany();
    recruiter = await factories.createRecruiter({ company: company._id });
    job = await factories.createJob({ company: company._id, recruiter: recruiter._id });

    seekerHeaders = getAuthHeaders(seeker, 'seeker');
    recruiterHeaders = getAuthHeaders(recruiter, 'recruiter');
  });

  test('Retrieve Seeker Dashboard metrics successfully', async () => {
    seeker.savedJobs.push({ job: job._id });
    seeker.profile.education.push({ school: 'Yale', degree: 'BS' });
    await seeker.save();

    await factories.createApplication({
      applicant: seeker._id,
      recruiter: recruiter._id,
      company: company._id,
      job: job._id,
      status: 'Applied'
    });

    const res = await request(app)
      .get('/api/dashboard/user')
      .set(seekerHeaders);

    expect(res.status).toBe(200);
    expect(res.body.totalApplications).toBe(1);
    expect(res.body.savedJobs.length).toBe(1);
    expect(res.body.applicationsByStatus.Applied).toBe(1);
    expect(res.body.recentApplications.length).toBe(1);
    expect(res.body.profileCompletionPercentage).toBeGreaterThan(0);
  });

  test('Retrieve Recruiter Dashboard metrics successfully', async () => {
    // Create an additional closed job
    await factories.createJob({
      company: company._id,
      recruiter: recruiter._id,
      status: 'Closed',
      title: 'Old developer role'
    });
    
    // Create an application
    await factories.createApplication({
      applicant: seeker._id,
      recruiter: recruiter._id,
      company: company._id,
      job: job._id
    });

    const res = await request(app)
      .get('/api/dashboard/recruiter')
      .set(recruiterHeaders);

    expect(res.status).toBe(200);
    expect(res.body.totalJobs).toBe(2);
    expect(res.body.activeJobs).toBe(1);
    expect(res.body.closedJobs).toBe(1);
    expect(res.body.totalApplications).toBe(1);
    expect(res.body.recentApplications.length).toBe(1);
    expect(res.body.applicantCountsPerJob.length).toBe(1);
    expect(res.body.applicantCountsPerJob[0].applicantCount).toBe(1);
  });
});
