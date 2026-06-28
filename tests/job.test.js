import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import { getAuthHeaders } from './helpers/auth.js';
import Job from '../models/jobModel.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Job API Integration Tests', () => {
  let company;
  let recruiter;
  let authHeaders;

  beforeEach(async () => {
    company = await factories.createCompany();
    recruiter = await factories.createRecruiter({ company: company._id });
    authHeaders = getAuthHeaders(recruiter, 'recruiter');
  });

  test('Create job listing successfully by associated recruiter', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set(authHeaders)
      .send({
        title: 'Full Stack Engineer',
        description: 'Build awesome MERN apps',
        requirements: 'Node and React skills',
        responsibilities: 'Write backend services',
        employmentType: 'Full-time',
        experienceLevel: 'Mid Level',
        location: 'Remote',
        category: 'Engineering',
        skills: ['Node.js', 'React']
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('created successfully');
    expect(res.body.job.title).toBe('Full Stack Engineer');
    expect(res.body.job.status).toBe('Open');
  });

  test('Reject job creation if recruiter is not linked to any company', async () => {
    const unassociatedRecruiter = await factories.createRecruiter();
    const headers = getAuthHeaders(unassociatedRecruiter, 'recruiter');

    const res = await request(app)
      .post('/api/jobs')
      .set(headers)
      .send({
        title: 'Developer',
        description: 'Desc',
        requirements: 'Reqs',
        responsibilities: 'Resps',
        employmentType: 'Full-time',
        experienceLevel: 'Mid Level',
        location: 'Remote',
        category: 'Engineering'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('associated with a company');
  });

  test('Edit job details successfully by owner company recruiter', async () => {
    const job = await factories.createJob({ company: company._id, recruiter: recruiter._id });

    const res = await request(app)
      .put(`/api/jobs/${job._id}`)
      .set(authHeaders)
      .send({
        title: 'Lead Full Stack Engineer'
      });

    expect(res.status).toBe(200);
    expect(res.body.job.title).toBe('Lead Full Stack Engineer');
  });

  test('Reject editing job from different company recruiter', async () => {
    const anotherCompany = await factories.createCompany({ companyName: 'Other Corp' });
    const anotherRecruiter = await factories.createRecruiter({ company: anotherCompany._id });
    const otherHeaders = getAuthHeaders(anotherRecruiter, 'recruiter');

    const job = await factories.createJob({ company: company._id, recruiter: recruiter._id });

    const res = await request(app)
      .put(`/api/jobs/${job._id}`)
      .set(otherHeaders)
      .send({
        title: 'Hacked Title'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  test('Close and reopen job successfully by company recruiter', async () => {
    const job = await factories.createJob({ company: company._id, recruiter: recruiter._id });

    // Close
    const closeRes = await request(app)
      .put(`/api/jobs/${job._id}/close`)
      .set(authHeaders);
    expect(closeRes.status).toBe(200);
    expect(closeRes.body.job.status).toBe('Closed');

    // Reopen
    const reopenRes = await request(app)
      .put(`/api/jobs/${job._id}/reopen`)
      .set(authHeaders);
    expect(reopenRes.status).toBe(200);
    expect(reopenRes.body.job.status).toBe('Open');
  });

  test('Delete job listing successfully by owner recruiter', async () => {
    const job = await factories.createJob({ company: company._id, recruiter: recruiter._id });

    const res = await request(app)
      .delete(`/api/jobs/${job._id}`)
      .set(authHeaders);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted successfully');

    const checkJob = await Job.findById(job._id);
    expect(checkJob).toBeNull();
  });

  test('Retrieve job details by ID', async () => {
    const job = await factories.createJob({ company: company._id, recruiter: recruiter._id });

    const res = await request(app)
      .get(`/api/jobs/${job._id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(job.title);
    expect(res.body.company.companyName).toBe(company.companyName);
  });

  test('List jobs with pagination, sorting, and specific query filters', async () => {
    // Create multiple jobs with different properties
    await factories.createJob({ company: company._id, recruiter: recruiter._id, title: 'React dev', location: 'Austin, TX', employmentType: 'Full-time', category: 'Frontend' });
    await factories.createJob({ company: company._id, recruiter: recruiter._id, title: 'Node dev', location: 'Remote', employmentType: 'Contract', category: 'Backend' });

    // Filter by location
    const resLoc = await request(app)
      .get('/api/jobs')
      .query({ location: 'Austin' });
    expect(resLoc.status).toBe(200);
    expect(resLoc.body.jobs.length).toBe(1);
    expect(resLoc.body.jobs[0].title).toBe('React dev');

    // Filter by employmentType
    const resType = await request(app)
      .get('/api/jobs')
      .query({ employmentType: 'Contract' });
    expect(resType.status).toBe(200);
    expect(resType.body.jobs.length).toBe(1);
    expect(resType.body.jobs[0].title).toBe('Node dev');

    // Filter by title
    const resTitle = await request(app)
      .get('/api/jobs')
      .query({ title: 'React' });
    expect(resTitle.status).toBe(200);
    expect(resTitle.body.jobs[0].title).toBe('React dev');

    // Filter by category
    const resCat = await request(app)
      .get('/api/jobs')
      .query({ category: 'Backend' });
    expect(resCat.status).toBe(200);
    expect(resCat.body.jobs[0].title).toBe('Node dev');
  });

  test('Return 400 for invalid job ID formats', async () => {
    const res = await request(app)
      .get('/api/jobs/invalid-id');

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
