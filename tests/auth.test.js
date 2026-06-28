import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';
import User from '../models/userModel.js';
import Recruiter from '../models/recruiterModel.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Authentication API Integration Tests', () => {
  describe('Job Seeker Authentication', () => {
    test('Register seeker successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register/seeker')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.accountType).toBe('seeker');
      expect(res.body.email).toBe('jane@example.com');
      
      const user = await User.findOne({ email: 'jane@example.com' });
      expect(user).toBeTruthy();
    });

    test('Reject duplicate email registration', async () => {
      await User.create({
        name: 'Existing Seeker',
        email: 'exist@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register/seeker')
        .send({
          name: 'New Seeker',
          email: 'exist@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already exists');
    });

    test('Reject invalid email address structure', async () => {
      const res = await request(app)
        .post('/api/auth/register/seeker')
        .send({
          name: 'Jane Doe',
          email: 'not-an-email',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test('Reject weak password (< 6 characters)', async () => {
      const res = await request(app)
        .post('/api/auth/register/seeker')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    test('Login seeker successfully', async () => {
      await User.create({
        name: 'Login Seeker',
        email: 'login@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.accountType).toBe('seeker');
    });

    test('Reject invalid password on seeker login', async () => {
      await User.create({
        name: 'Login Seeker',
        email: 'login@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });

    test('Access seeker protected route with Bearer JWT token', async () => {
      await User.create({
        name: 'Protected Seeker',
        email: 'protected@example.com',
        password: 'password123'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'protected@example.com',
          password: 'password123'
        });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('protected@example.com');
      expect(res.body.accountType).toBe('seeker');
    });

    test('Reject seeker protected route without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('no token provided');
    });

    test('Logout successfully sets cookie expiration in response headers', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    });
  });

  describe('Recruiter Authentication', () => {
    test('Register recruiter successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register/recruiter')
        .send({
          recruiterName: 'John Recruiter',
          email: 'recruiter@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.accountType).toBe('recruiter');
      expect(res.body.email).toBe('recruiter@example.com');

      const rec = await Recruiter.findOne({ email: 'recruiter@example.com' });
      expect(rec).toBeTruthy();
    });

    test('Reject duplicate recruiter email registration', async () => {
      await Recruiter.create({
        recruiterName: 'Existing Recruiter',
        email: 'recruiter@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register/recruiter')
        .send({
          recruiterName: 'New Recruiter',
          email: 'recruiter@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already exists');
    });

    test('Login recruiter successfully', async () => {
      await Recruiter.create({
        recruiterName: 'Login Recruiter',
        email: 'rec@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rec@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.accountType).toBe('recruiter');
    });

    test('Access recruiter protected routes with token', async () => {
      await Recruiter.create({
        recruiterName: 'Rec User',
        email: 'rec@example.com',
        password: 'password123'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rec@example.com',
          password: 'password123'
        });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.recruiterName).toBe('Rec User');
      expect(res.body.accountType).toBe('recruiter');
    });
  });
});
