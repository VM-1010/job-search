import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import { getAuthHeaders } from './helpers/auth.js';
import Notification from '../models/notificationModel.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Notification API Integration Tests', () => {
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

  test('Notification created automatically on application and retrieved by recruiter', async () => {
    // Seeker submits job application
    await request(app)
      .post('/api/applications')
      .set(seekerHeaders)
      .send({ jobId: job._id });

    // Recruiter fetches notification log
    const res = await request(app)
      .get('/api/notifications')
      .set(recruiterHeaders);

    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBe(1);
    expect(res.body.notifications[0].type).toBe('application_received');
    expect(res.body.notifications[0].recipient.toString()).toBe(recruiter._id.toString());
  });

  test('Notification created automatically on application status update and retrieved by seeker', async () => {
    const application = await factories.createApplication({
      applicant: seeker._id,
      recruiter: recruiter._id,
      company: company._id,
      job: job._id
    });

    // Recruiter moves status to Shortlisted
    await request(app)
      .put(`/api/applications/${application._id}/status`)
      .set(recruiterHeaders)
      .send({ status: 'Shortlisted' });

    // Seeker retrieves notifications
    const res = await request(app)
      .get('/api/notifications')
      .set(seekerHeaders);

    expect(res.status).toBe(200);
    expect(res.body.notifications.length).toBe(1);
    expect(res.body.notifications[0].type).toBe('application_status_updated');
    expect(res.body.notifications[0].recipient.toString()).toBe(seeker._id.toString());
  });

  test('Mark notification as read and delete notification successfully', async () => {
    const notif = await factories.createNotification({ recipient: seeker._id });

    // Mark as read
    const readRes = await request(app)
      .put(`/api/notifications/${notif._id}/read`)
      .set(seekerHeaders);

    expect(readRes.status).toBe(200);
    expect(readRes.body.notification.read).toBe(true);

    // Delete
    const deleteRes = await request(app)
      .delete(`/api/notifications/${notif._id}`)
      .set(seekerHeaders);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toContain('deleted successfully');

    const checkNotif = await Notification.findById(notif._id);
    expect(checkNotif).toBeNull();
  });
});
