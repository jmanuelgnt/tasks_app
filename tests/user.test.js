const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/users')
const {userOneId, userOne, setUpDatabase} = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should signup a new user', async () => {
    await request(app).post('/users').send({
        name : 'Jose',
        email : 'jose.carranza3@telusinternational.com',
        password : '123!Pass!123'
    }).expect(201)
})

test('Should login existing user', async () => {
    await request(app).post('/users/login').send({
        email : userOne.email,
        password : userOne.password
    }).expect(200)
})

test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email : userOne.email,
        password: 'thisisnotthecorrectpassword'
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)
        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    let newName = 'This is my new name'
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({name : newName})
        .expect(200)

        const user = await User.findById(userOneId)
        expect(user.name).toEqual(newName)

})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({'location': 'fake location'})
        .expect(400)

})