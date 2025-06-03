const request = require('supertest');
const { app, server } = require('../src/app');
const { resetUsers, findUserByEmail } = require('../src/models/userModel'); // findUserByEmail for setup verification

let testUserToken;
let testUserId;
const testUserEmail = 'profile@example.com';
const testUserUsername = 'profileuser';

beforeAll(async () => {
  resetUsers(); // Reset users at the very beginning of this test suite
  // Register a user and login to get a token for protected routes
  await request(app)
    .post('/api/auth/register')
    .send({
      username: testUserUsername,
      email: testUserEmail,
      password: 'password123',
      fullName: 'Profile User Initial'
    });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUserEmail, password: 'password123' });

  testUserToken = loginRes.body.token;
  testUserId = loginRes.body.user.id;
  // console.log('Test user ID:', testUserId, 'Token:', testUserToken); // For debugging
});

afterAll((done) => {
  server.close(done); // Close server after all tests in this file are done
});

describe('User Profile Endpoints', () => {
  it('should get a user profile successfully by ID', async () => {
    const res = await request(app).get(`/api/users/${testUserId}/profile`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', testUserId);
    expect(res.body).toHaveProperty('username', testUserUsername);
    expect(res.body).toHaveProperty('fullName', 'Profile User Initial');
    expect(res.body).not.toHaveProperty('email'); // Email should not be in public profile
  });

  it('should return 404 for non-existent user profile ID', async () => {
    const nonExistentUserId = 99999;
    const res = await request(app).get(`/api/users/${nonExistentUserId}/profile`);
    expect(res.statusCode).toEqual(404);
  });

  it('should return 400 for invalid user ID format', async () => {
    const res = await request(app).get('/api/users/invalidUserIdFormat/profile');
    expect(res.statusCode).toEqual(400); // As per controller logic
    expect(res.body).toHaveProperty('message', 'Invalid user ID format.');
  });


  it('should update the authenticated user profile successfully', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        fullName: 'Updated Name',
        bio: 'This is my new bio.',
        profilePictureUrl: 'http://example.com/newpic.jpg'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('fullName', 'Updated Name');
    expect(res.body.user).toHaveProperty('bio', 'This is my new bio.');
    expect(res.body.user).toHaveProperty('profilePictureUrl', 'http://example.com/newpic.jpg');
    expect(res.body.user).toHaveProperty('id', testUserId); // Ensure it's the same user
  });

  it('should fail to update profile without authentication token', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .send({ fullName: 'No Auth Update' });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Not authorized, no token provided');
  });

  it('should fail to update profile with an invalid token', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer invalidtoken123`)
      .send({ fullName: 'Bad Auth Update' });
    expect(res.statusCode).toEqual(401);
    // The exact message depends on the JWT library's error and how authMiddleware handles it
    // expect(res.body).toHaveProperty('message', 'Not authorized, token failed');
  });

   it('should partially update the authenticated user profile (only bio)', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({
        bio: 'A newer bio just for this test.',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.user).toHaveProperty('bio', 'A newer bio just for this test.');
    // FullName should remain from previous update or initial if this test runs in isolation for data
    // This depends on test execution order if data is not reset between specific describe/it blocks
    // For this setup, `beforeAll` runs once, so `fullName` will be 'Updated Name' from the previous test.
    expect(res.body.user).toHaveProperty('fullName', 'Updated Name');
  });

   it('should return 400 if no update data is provided for profile update', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({}); // Empty body
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'No update data provided.');
  });

});
