import * as db from './helpers/db.js';
import * as factories from './helpers/factories.js';
import Company from '../models/companyModel.js';
import Recruiter from '../models/recruiterModel.js';
import Job from '../models/jobModel.js';
import Application from '../models/applicationModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Database Integrity and Reference Tests', () => {
  test('Verify cross-referencing between Company and Recruiter', async () => {
    const company = await factories.createCompany();
    const recruiter = await factories.createRecruiter({ company: company._id });
    
    company.recruiters.push(recruiter._id);
    await company.save();

    const companyDb = await Company.findById(company._id);
    expect(companyDb.recruiters).toContainEqual(recruiter._id);

    const recruiterDb = await Recruiter.findById(recruiter._id);
    expect(recruiterDb.company.toString()).toBe(company._id.toString());
  });

  test('Verify Job references both Recruiter and Company', async () => {
    const company = await factories.createCompany();
    const recruiter = await factories.createRecruiter({ company: company._id });
    const job = await factories.createJob({ company: company._id, recruiter: recruiter._id });

    const jobDb = await Job.findById(job._id);
    expect(jobDb.company.toString()).toBe(company._id.toString());
    expect(jobDb.recruiter.toString()).toBe(recruiter._id.toString());
  });

  test('Verify Application references User, Recruiter, Company, and Job', async () => {
    const seeker = await factories.createSeeker();
    const company = await factories.createCompany();
    const recruiter = await factories.createRecruiter({ company: company._id });
    const job = await factories.createJob({ company: company._id, recruiter: recruiter._id });
    
    const application = await factories.createApplication({
      applicant: seeker._id,
      recruiter: recruiter._id,
      company: company._id,
      job: job._id
    });

    const appDb = await Application.findById(application._id);
    expect(appDb.applicant.toString()).toBe(seeker._id.toString());
    expect(appDb.recruiter.toString()).toBe(recruiter._id.toString());
    expect(appDb.company.toString()).toBe(company._id.toString());
    expect(appDb.job.toString()).toBe(job._id.toString());
  });

  test('Verify Saved Jobs references Job inside User', async () => {
    const seeker = await factories.createSeeker();
    const company = await factories.createCompany();
    const recruiter = await factories.createRecruiter({ company: company._id });
    const job = await factories.createJob({ company: company._id, recruiter: recruiter._id });

    seeker.savedJobs.push({ job: job._id });
    await seeker.save();

    const userDb = await User.findById(seeker._id);
    expect(userDb.savedJobs[0].job.toString()).toBe(job._id.toString());
  });

  test('Verify Notification references recipient ID', async () => {
    const seeker = await factories.createSeeker();
    const notification = await factories.createNotification({ recipient: seeker._id });

    const notifDb = await Notification.findById(notification._id);
    expect(notifDb.recipient.toString()).toBe(seeker._id.toString());
  });
});
