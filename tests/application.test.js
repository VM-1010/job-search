import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import { getAuthHeaders } from './helpers/auth.js';
import Application from '../models/applicationModel.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Application API Integration Tests', () => {
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

  test('Apply to job, verify database references and profile snapshot immutability', async () => {
    seeker.profile.skills.push({ name: 'Node.js', level: 'Expert' });
    await seeker.save();

    const res = await request(app)
      .post('/api/applications')
      .set(seekerHeaders)
      .send({
        jobId: job._id,
        coverLetter: 'Hire me please!'
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('submitted successfully');
    expect(res.body.application.coverLetter).toBe('Hire me please!');
    expect(res.body.application.status).toBe('Applied');

    // Verify DB references are correctly stored
    const appDb = await Application.findById(res.body.application._id);
    expect(appDb.applicant.toString()).toBe(seeker._id.toString());
    expect(appDb.recruiter.toString()).toBe(recruiter._id.toString());
    expect(appDb.company.toString()).toBe(company._id.toString());
    expect(appDb.job.toString()).toBe(job._id.toString());

    // Verify immutable snapshot contains current details
    expect(appDb.profileSnapshot.name).toBe(seeker.name);
    expect(appDb.profileSnapshot.skills.length).toBe(1);
    expect(appDb.profileSnapshot.skills[0].name).toBe('Node.js');

    // Modify user profile name and skill set
    seeker.name = 'Jane Changed';
    seeker.profile.skills = [];
    await seeker.save();

    // Verify application profileSnapshot in DB is unaffected by subsequent changes
    const appDbAfter = await Application.findById(res.body.application._id);
    expect(appDbAfter.profileSnapshot.name).toBe('Test Seeker');
    expect(appDbAfter.profileSnapshot.skills.length).toBe(1);
  });

  test('Prevent duplicate applications for the same job by seeker', async () => {
    await request(app)
      .post('/api/applications')
      .set(seekerHeaders)
      .send({ jobId: job._id });

    const res = await request(app)
      .post('/api/applications')
      .set(seekerHeaders)
      .send({ jobId: job._id });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already applied');
  });

  test('Retrieve logged-in job seeker own applications list', async () => {
    await factories.createApplication({
      applicant: seeker._id,
      recruiter: recruiter._id,
      company: company._id,
      job: job._id
    });

    const res = await request(app)
      .get('/api/applications/my-applications')
      .set(seekerHeaders);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].job._id.toString()).toBe(job._id.toString());
  });

  test('Recruiter views applicants for job and executes status transition workflow', async () => {
    const application = await factories.createApplication({
      applicant: seeker._id,
      recruiter: recruiter._id,
      company: company._id,
      job: job._id
    });

    // View applicants
    const viewRes = await request(app)
      .get(`/api/applications/job/${job._id}`)
      .set(recruiterHeaders);

    expect(viewRes.status).toBe(200);
    expect(viewRes.body.length).toBe(1);
    expect(viewRes.body[0].applicant.name).toBe(seeker.name);

    // Status transition workflow tests
    const statuses = ['Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Accepted'];
    for (const status of statuses) {
      const updateRes = await request(app)
        .put(`/api/applications/${application._id}/status`)
        .set(recruiterHeaders)
        .send({ status });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.application.status).toBe(status);
    }
  });

  test('Block unauthorized applicant access for seekers and unlinked recruiters', async () => {
    const otherCompany = await factories.createCompany();
    const anotherRecruiter = await factories.createRecruiter({ company: otherCompany._id });
    const otherRecruiterHeaders = getAuthHeaders(anotherRecruiter, 'recruiter');

    // Seeker blocked from viewing job applicant list
    const res1 = await request(app)
      .get(`/api/applications/job/${job._id}`)
      .set(seekerHeaders);
    expect(res1.status).toBe(403);

    // Recruiters from other companies blocked from viewing job applicants
    const res2 = await request(app)
      .get(`/api/applications/job/${job._id}`)
      .set(otherRecruiterHeaders);
    expect(res2.status).toBe(403);
  });
});
