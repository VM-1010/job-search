import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import { getAuthHeaders } from './helpers/auth.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Validation Tests', () => {
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

  test('Missing required fields during company creation returns 400', async () => {
    const res = await request(app)
      .post('/api/companies')
      .set(recruiterHeaders)
      .send({ website: 'https://missingname.com' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].msg).toContain('name is required');
  });

  test('Invalid ObjectIds in URL parameters returns 400', async () => {
    const res = await request(app)
      .get('/api/companies/invalid-mongo-id');

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toContain('Invalid company ID format');
  });

  test('Invalid enums for employmentType during job creation returns 400', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set(recruiterHeaders)
      .send({
        title: 'Developer',
        description: 'Desc',
        requirements: 'Reqs',
        responsibilities: 'Resps',
        employmentType: 'Super-Full-Time', // Invalid enum
        experienceLevel: 'Mid Level',
        location: 'Remote',
        category: 'Engineering'
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].msg).toContain('Employment type must be');
  });

  test('Invalid enums for status updates on applications returns 400', async () => {
    const application = await factories.createApplication({
      applicant: seeker._id,
      recruiter: recruiter._id,
      company: company._id,
      job: job._id
    });

    const res = await request(app)
      .put(`/api/applications/${application._id}/status`)
      .set(recruiterHeaders)
      .send({ status: 'Super-Accepted' }); // Invalid status

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toContain('Invalid application status');
  });
});
