const request = require('supertest')
const Task = require('../src/models/tasks')
const app = require('../src/app')
const {userOneId, userOne,taskThree, setUpDatabase} = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description : 'Task created from test'
        })
        .expect(201)

        const task = await Task.findById(response.body._id)
        expect(task).not.toBeNull()
        expect(task.completed).toBe(false)
})

test('Should get all task from a user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)
})

test('Should not delete task from another user', async () => {
    const response = await request(app)
        .delete(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)

    const task = Task.findById(taskThree._id)
    expect(task).not.toBeNull();
})