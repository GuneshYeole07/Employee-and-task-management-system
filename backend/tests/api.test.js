import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app.js';

// These requests are rejected before any database access, so no MongoDB is needed.
describe('API validation (no database)', () => {
  it('health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });
  it('404 for unknown routes and malformed ids', async () => {
    expect((await request(app).get('/api/nope')).status).toBe(404);
    expect((await request(app).get('/api/tasks/not-an-id')).status).toBe(404);
  });
  it('400 when status is sent through create / edit', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'x', status: 'Completed' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/PUT \/api\/tasks\/:id\/status/);
    const put = await request(app).put('/api/tasks/64b7f0f2f2f2f2f2f2f2f2f2').send({ status: 'Completed' });
    expect(put.status).toBe(400);
  });
  it('400 for invalid status value and invalid task body', async () => {
    const id = '64b7f0f2f2f2f2f2f2f2f2f2';
    expect((await request(app).put(`/api/tasks/${id}/status`).send({ status: 'Done' })).status).toBe(400);
    const bad = await request(app).post('/api/tasks').send({ title: 'Valid title', employee: id, department: 'QA', priority: 'High', startDate: '2026-10-10', dueDate: '2026-10-01' });
    expect(bad.status).toBe(400);
    expect(bad.body.errors[0].path).toBe('dueDate');
  });
  it('400 for invalid employee body and bad list queries', async () => {
    const res = await request(app).post('/api/employees').send({ employeeId: 'E1', fullName: 'A', email: 'nope', phone: '1', status: 'On Leave' });
    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(3);
    expect((await request(app).get('/api/tasks?status=Bogus')).status).toBe(400);
    expect((await request(app).get('/api/tasks?sortBy=hack')).status).toBe(400);
  });
});
