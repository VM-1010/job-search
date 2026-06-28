import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import { getAuthHeaders } from './helpers/auth.js';
import Recruiter from '../models/recruiterModel.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Company API Integration Tests', () => {
  test('Create company and link recruiter successfully', async () => {
    const recruiter = await factories.createRecruiter();
    const authHeaders = getAuthHeaders(recruiter, 'recruiter');

    const res = await request(app)
      .post('/api/companies')
      .set(authHeaders)
      .send({
        companyName: 'Acme Corp',
        website: 'https://acme.org',
        contactEmail: 'hr@acme.org',
        foundedYear: 2010,
        companySize: '11-50'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('created successfully');
    expect(res.body.company.companyName).toBe('Acme Corp');
    expect(res.body.recruiterCount).toBe(1);

    // Verify recruiter is linked to company
    const updatedRecruiter = await Recruiter.findById(recruiter._id);
    expect(updatedRecruiter.company.toString()).toBe(res.body.company._id);
  });

  test('Reject company creation if recruiter already has a company', async () => {
    const company = await factories.createCompany();
    const recruiter = await factories.createRecruiter({ company: company._id });
    const authHeaders = getAuthHeaders(recruiter, 'recruiter');

    const res = await request(app)
      .post('/api/companies')
      .set(authHeaders)
      .send({
        companyName: 'Second Corp'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already associated with a company');
  });

  test('Get company by valid ID with active recruiter and job counts', async () => {
    const company = await factories.createCompany();
    const recruiter = await factories.createRecruiter({ company: company._id });
    company.recruiters.push(recruiter._id);
    await company.save();

    // Create a job for the company to verify job counts
    await factories.createJob({ company: company._id, recruiter: recruiter._id });

    const res = await request(app)
      .get(`/api/companies/${company._id}`);

    expect(res.status).toBe(200);
    expect(res.body.company.companyName).toBe(company.companyName);
    expect(res.body.recruiterCount).toBe(1);
    expect(res.body.activeJobsCount).toBe(1);
  });

  test('Update company details successfully by associated recruiter', async () => {
    const company = await factories.createCompany();
    const recruiter = await factories.createRecruiter({ company: company._id });
    company.recruiters.push(recruiter._id);
    await company.save();

    const authHeaders = getAuthHeaders(recruiter, 'recruiter');

    const res = await request(app)
      .put(`/api/companies/${company._id}`)
      .set(authHeaders)
      .send({
        companyName: 'Acme Corp Updated',
        description: 'New Description'
      });

    expect(res.status).toBe(200);
    expect(res.body.company.companyName).toBe('Acme Corp Updated');
    expect(res.body.company.description).toBe('New Description');
  });

  test('Reject unauthorized company update by another recruiter not belonging to company', async () => {
    const company = await factories.createCompany();
    const anotherRecruiter = await factories.createRecruiter();

    const authHeaders = getAuthHeaders(anotherRecruiter, 'recruiter');

    const res = await request(app)
      .put(`/api/companies/${company._id}`)
      .set(authHeaders)
      .send({
        companyName: 'Hacked Corp'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });

  test('List companies with search and pagination support', async () => {
    await factories.createCompany({ companyName: 'Company Alpha', industry: 'Finance' });
    await factories.createCompany({ companyName: 'Company Beta', industry: 'Tech' });

    const res = await request(app)
      .get('/api/companies')
      .query({ search: 'Alpha' });

    expect(res.status).toBe(200);
    expect(res.body.companies.length).toBe(1);
    expect(res.body.companies[0].company.companyName).toBe('Company Alpha');
  });

  test('Return 400 validation error for invalid company ID format in getCompany', async () => {
    const res = await request(app)
      .get('/api/companies/invalid-id');

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
