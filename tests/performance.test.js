import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import { getAuthHeaders } from './helpers/auth.js';
import Job from '../models/jobModel.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Performance Smoke Tests', () => {
  let seeker;
  let company;
  let recruiter;
  let seekerHeaders;

  beforeEach(async () => {
    seeker = await factories.createSeeker();
    company = await factories.createCompany();
    recruiter = await factories.createRecruiter({ company: company._id });

    seekerHeaders = getAuthHeaders(seeker, 'seeker');
  });

  test('Scale test: Create 100 jobs, verify fast pagination, searching, and dashboard times', async () => {
    const jobCount = 100;
    const jobsData = [];

    for (let i = 0; i < jobCount; i++) {
      jobsData.push({
        title: `Developer Job #${i}`,
        description: `Description of developer job number ${i}`,
        requirements: 'Requirements here',
        responsibilities: 'Responsibilities here',
        skills: ['Node.js', 'React', 'MongoDB'],
        employmentType: 'Full-time',
        experienceLevel: 'Mid Level',
        location: i % 2 === 0 ? 'Remote' : 'New York, NY',
        category: i % 3 === 0 ? 'Engineering' : 'Design',
        company: company._id,
        recruiter: recruiter._id,
        status: 'Open'
      });
    }

    const insertStartTime = Date.now();
    await Job.insertMany(jobsData);
    const insertDuration = Date.now() - insertStartTime;
    expect(insertDuration).toBeLessThan(2500);

    // Retrieve paginated jobs
    const pageStartTime = Date.now();
    const paginatedRes = await request(app)
      .get('/api/jobs')
      .query({ page: 1, limit: 10 });
    const pageDuration = Date.now() - pageStartTime;

    expect(paginatedRes.status).toBe(200);
    expect(paginatedRes.body.jobs.length).toBe(10);
    expect(paginatedRes.body.total).toBe(jobCount);
    expect(pageDuration).toBeLessThan(1000); // Check pagination speed

    // Search jobs using query parameters
    const searchStartTime = Date.now();
    const searchRes = await request(app)
      .get('/api/jobs')
      .query({ search: 'Developer Job #50' });
    const searchDuration = Date.now() - searchStartTime;

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.jobs.length).toBeGreaterThan(0);
    expect(searchDuration).toBeLessThan(1000); // Check search speed

    // Retrieve dashboard metrics
    const dashStartTime = Date.now();
    const dashRes = await request(app)
      .get('/api/dashboard/user')
      .set(seekerHeaders);
    const dashDuration = Date.now() - dashStartTime;

    expect(dashRes.status).toBe(200);
    expect(dashDuration).toBeLessThan(1000); // Check dashboard load speed
  });
});
