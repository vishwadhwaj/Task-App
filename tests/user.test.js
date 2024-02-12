const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const app = require('../src/app')
const { User } = require('../src/model/User')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
  _id: userOneId,
  name: 'Mike',
  email: 'mike@example.com',
  password: 'mike1234',
  age: 24,
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
}
beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

afterEach(() => {
  console.log('After each')
})

test('Should signup a new user', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'himanchal',
      email: '   himanchal@YAHOO.com ',
      password: '  himanchal1234  ',
      age: 21,
    })
    .expect(201)
})

test('Should login an existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200)
})

test('Should not login non-existent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'arungmail.com',
      password: 'hello',
    })
    .expect(400)
})

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthorized user', async () => {
  await request(app).get('/users/me').send().expect(401)
})

test('Should delete account for authenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401)
})
