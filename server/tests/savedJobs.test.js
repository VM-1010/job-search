import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import { getAuthHeaders } from './helpers/auth.js';
import User from '../models/userModel.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Saved Jobs API Integration Tests', () => {
  let seeker;
  let company;
  let recruiter;
  let job;
  let seekerHeaders;

  beforeEach(async () => {
    seeker = await factories.createSeeker();
    company = await factories.createCompany();
    recruiter = await factories.createRecruiter({ company: company._id });
    job = await factories.createJob({ company: company._id, recruiter: recruiter._id });

    seekerHeaders = getAuthHeaders(seeker, 'seeker');
  });

  test('Save job successfully and prevent duplicate entries', async () => {
    const res = await request(app)
      .post(`/api/users/saved-jobs/${job._id}`)
      .set(seekerHeaders);

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('saved successfully');

    // Verify DB record
    const checkUser = await User.findById(seeker._id);
    expect(checkUser.savedJobs.length).toBe(1);
    expect(checkUser.savedJobs[0].job.toString()).toBe(job._id.toString());

    // Try saving again (duplicate)
    const dupRes = await request(app)
      .post(`/api/users/saved-jobs/${job._id}`)
      .set(seekerHeaders);

    expect(dupRes.status).toBe(400);
    expect(dupRes.body.message).toContain('already saved');
  });

  test('Remove saved job successfully', async () => {
    seeker.savedJobs.push({ job: job._id });
    await seeker.save();

    const res = await request(app)
      .delete(`/api/users/saved-jobs/${job._id}`)
      .set(seekerHeaders);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('removed successfully');

    const checkUser = await User.findById(seeker._id);
    expect(checkUser.savedJobs.length).toBe(0);
  });

  test('List saved jobs successfully, sorted newest-first', async () => {
    const job2 = await factories.createJob({ company: company._id, recruiter: recruiter._id });
    
    // Add saved jobs with specific timestamps
    seeker.savedJobs.push({ job: job._id, savedAt: new Date(Date.now() - 5000) });
    seeker.savedJobs.push({ job: job2._id, savedAt: new Date() });
    await seeker.save();

    const res = await request(app)
      .get('/api/users/saved-jobs')
      .set(seekerHeaders);

    expect(res.status).toBe(200);
    expect(res.body.savedJobs.length).toBe(2);
    // Newest first sorting assertion
    expect(res.body.savedJobs[0].job._id.toString()).toBe(job2._id.toString());
  });

  test('Block unauthorized saved job modification for recruiters', async () => {
    const recHeaders = getAuthHeaders(recruiter, 'recruiter');

    const res = await request(app)
      .post(`/api/users/saved-jobs/${job._id}`)
      .set(recHeaders);

    expect(res.status).toBe(403);
  });
});
