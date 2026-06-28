import request from 'supertest';
import app from '../app.js';
import * as db from './helpers/db.js';

beforeAll(async () => await db.connect());
afterEach(async () => await db.clear());
afterAll(async () => await db.close());

describe('Error Handling Integration Tests', () => {
  test('Return 404 for non-existent route paths', async () => {
    const res = await request(app)
      .get('/api/invalid-route-path');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Not Found');
  });

  test('Return 401 for requests missing JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('no token provided');
  });

  test('Return 401 for requests with malformed JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer malformed-token-string');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('token validation failed');
  });

  test('Return 401 for requests with expired JWT', async () => {
    // Generate expired signature/structure tokens and check validation rejects it
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0OWM3ZGE3YTg1YjYyMDlkMWU5ZGUxNiIsImFjY291bnRUeXBlIjoic2Vla2VyIiwiaWF0IjoxNTAwMDAwMDAwLCJleHAiOjE1MDAwMDAxMDB9.invalid_signature');
    
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('token validation failed');
  });

  test('Handle database casting errors gracefully', async () => {
    const res = await request(app)
      .get('/api/companies/short-id');
    expect(res.status).toBe(400);
  });
});
