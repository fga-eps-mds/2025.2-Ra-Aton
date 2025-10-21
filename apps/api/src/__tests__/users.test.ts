import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma';

describe('API basic', () => {
  let dbAvailable = true;
  beforeAll(async () => {
    try {
      // Try to connect to DB; if not available, skip DB dependent tests
      await prisma.$connect();
      dbAvailable = true;
    } catch (err) {
       
      console.warn('DB not available for tests, skipping integration tests.');
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    if (dbAvailable) {
      await prisma.user.deleteMany();
      await prisma.$disconnect();
    }
  });

  it('GET / responds', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('service', 'api');
  });

  it('CRUD /users', async () => {
    if (!dbAvailable) return; // skip when DB isn't available
    const create = await request(app).post('/users').send({ name: 'Test', email: 'test@example.com' });
    expect(create.status).toBe(201);
    expect(create.body).toHaveProperty('id');

    const list = await request(app).get('/users');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);

    const id = create.body.id;
    const get = await request(app).get(`/users/${id}`);
    expect(get.status).toBe(200);

    const del = await request(app).delete(`/users/${id}`);
    expect(del.status).toBe(204);
  }, 20000);
});
