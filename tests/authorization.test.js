import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import { getAuthHeaders } from './helpers/auth.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Authorization Integration Tests', () => {
  let seeker;
  let recruiter;
  let company;
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

  test('Unauthenticated requests return 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('Job Seeker cannot create company (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/companies')
      .set(seekerHeaders)
      .send({ companyName: 'Illegal Seeker Company' });
    expect(res.status).toBe(403);
  });

  test('Job Seeker cannot create job (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set(seekerHeaders)
      .send({ title: 'Illegal Seeker Job' });
    expect(res.status).toBe(403);
  });

  test('Job Seeker cannot access recruiter dashboard (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/dashboard/recruiter')
      .set(seekerHeaders);
    expect(res.status).toBe(403);
  });

  test('Recruiter cannot access seeker dashboard (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/dashboard/user')
      .set(recruiterHeaders);
    expect(res.status).toBe(403);
  });

  test('Recruiter cannot modify another company (403 Forbidden)', async () => {
    const anotherCompany = await factories.createCompany({ companyName: 'Other Corp' });
    
    const res = await request(app)
      .put(`/api/companies/${anotherCompany._id}`)
      .set(recruiterHeaders)
      .send({ companyName: 'Illegal Change' });
    expect(res.status).toBe(403);
  });

  test('Recruiter cannot modify another company\'s job listing (403 Forbidden)', async () => {
    const anotherCompany = await factories.createCompany({ companyName: 'Other Corp' });
    const anotherRecruiter = await factories.createRecruiter({ company: anotherCompany._id });
    const anotherJob = await factories.createJob({ company: anotherCompany._id, recruiter: anotherRecruiter._id });

    const res = await request(app)
      .put(`/api/jobs/${anotherJob._id}`)
      .set(recruiterHeaders)
      .send({ title: 'Illegal Job Update' });
    expect(res.status).toBe(403);
  });
});
