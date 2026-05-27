const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

beforeAll(async () => {
  // use the existing local MongoDB; ensure connection
  await mongoose.connect('mongodb://localhost:27017/sampledb');
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Faculty routes', () => {
  test('POST /faculty/save validates and creates a record', async () => {
    const res = await request(app)
      .post('/faculty/save')
      .send({ name: 'Test User', dept: 'CS' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'Test User');
    expect(res.body).toHaveProperty('dept', 'CS');
  });

  test('POST /faculty/save rejects invalid input', async () => {
    const res = await request(app)
      .post('/faculty/save')
      .send({ name: 'A' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(400);
  });

  test('PUT /faculty/update/:id updates an existing record', async () => {
    const createRes = await request(app)
      .post('/faculty/save')
      .send({ name: 'Update User', dept: 'IT' })
      .set('Accept', 'application/json');

    expect(createRes.statusCode).toBe(200);

    const updateRes = await request(app)
      .put(`/faculty/update/${createRes.body._id}`)
      .send({ name: 'Updated User', dept: 'HR' })
      .set('Accept', 'application/json');

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body).toHaveProperty('_id', createRes.body._id);
    expect(updateRes.body).toHaveProperty('name', 'Updated User');
    expect(updateRes.body).toHaveProperty('dept', 'HR');
  });

  test('DELETE /faculty/delete/:id removes an existing record', async () => {
    const createRes = await request(app)
      .post('/faculty/save')
      .send({ name: 'Delete User', dept: 'Ops' })
      .set('Accept', 'application/json');

    expect(createRes.statusCode).toBe(200);

    const deleteRes = await request(app)
      .delete(`/faculty/delete/${createRes.body._id}`)
      .set('Accept', 'application/json');

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('message', 'Faculty deleted');
    expect(deleteRes.body.deleted).toHaveProperty('_id', createRes.body._id);

    const lookupRes = await request(app)
      .get(`/faculty/${createRes.body._id}`)
      .set('Accept', 'application/json');

    expect(lookupRes.body).toBeNull();
  });
});
