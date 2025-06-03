const request = require('supertest');
const { app, server } = require('../src/app');
const { resetUsers } = require('../src/models/userModel');
const { _users_debug } = require('../src/models/userModel'); // For debugging if needed

beforeEach(() => {
  resetUsers(); // Clear users before each test
});

afterAll((done) => {
  server.close(done); // Close server after all tests are done for this file
});

describe('Auth Endpoints', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully!'); // Message from controller
    expect(res.body.user).toHaveProperty('username', 'testuser');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('should fail to register a user with missing username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testmissing@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Username, email, and password are required.');
  });

  it('should fail to register a user with an existing email', async () => {
    await request(app) // First user
      .post('/api/auth/register')
      .send({ username: 'user1', email: 'duplicate@example.com', password: 'password123' });

    const res = await request(app) // Second user with same email
      .post('/api/auth/register')
      .send({ username: 'user2', email: 'duplicate@example.com', password: 'password456' });
    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('message', 'User with this email already exists.');
  });

  it('should fail to register a user with an existing username', async () => {
    await request(app) // First user
      .post('/api/auth/register')
      .send({ username: 'duplicateuser', email: 'user1@example.com', password: 'password123' });

    const res = await request(app) // Second user with same username
      .post('/api/auth/register')
      .send({ username: 'duplicateuser', email: 'user2@example.com', password: 'password456' });
    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('message', 'Username already taken.');
  });


  it('should login an existing user successfully', async () => {
    // First, register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testlogin',
        email: 'login@example.com',
        password: 'password123',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toEqual('login@example.com');
    expect(res.body.user.username).toEqual('testlogin');
  });

  it('should fail to login with incorrect password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testloginfail', email: 'loginfail@example.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'loginfail@example.com', password: 'wrongpassword' });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid email or password.');
  });

  it('should fail to login with a non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'password123' });
    expect(res.statusCode).toEqual(401); // Controller sends 401 for user not found for security
    expect(res.body).toHaveProperty('message', 'Invalid email or password.');
  });
});
