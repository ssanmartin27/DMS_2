const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Doc = require('../models/doc')

beforeEach(async () => {
    await Doc.deleteMany({})

    let docObject = new Doc(helper.initialDocs[0])
    await docObject.save()

    docObject = new Doc(helper.initialDocs[1])
    await docObject.save()
  })

describe('when there is initially some notes saved', () => {

test('docs are returned as json', async () => {
  await api
    .get('/api/docs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('there are two docs', async () => {
    const response = await api.get('/api/docs')
  
    expect(response.body).toHaveLength(2)
  })
  
test("the title of the first doc is 'Crime and punishment'", async () => {
    const response = await api.get('/api/docs')  
    expect(response.body[0].title).toBe('Crime and punishment')
})

test('all docs are returned', async () => {
    const response = await api.get('/api/docs')
  
    expect(response.body).toHaveLength(helper.initialDocs.length)
  })
  
test('a specific doc is within the returned docs', async () => {
    const response = await api.get('/api/docs')
  
    const titles = response.body.map(r => r.title)
    expect(titles).toContain(
      'Introduction to quantum mechanics'
    )
  })
})

describe('viewing a specific doc', () => {
  test('succeeds with a valid id', async () => {
    const docsAtStart = await helper.docsInDb()

    const docToView = docsAtStart[0]

    const resultDoc = await api
      .get(`/api/docs/${docToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      
    const processedDocToView = JSON.parse(JSON.stringify(docToView))

    expect(resultDoc.body).toEqual(processedDocToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/docs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/docs/${invalidId}`)
      .expect(400)
  })
})

describe('deletion of a note', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const docsAtStart = await helper.docsInDb()
    const docToDelete = docsAtStart[0]

    await api
      .delete(`/api/docs/${docToDelete.id}`)
      .expect(204)

    const docsAtEnd = await helper.docsInDb()

    expect(docsAtEnd).toHaveLength(
      helper.initialDocs.length - 1
    )

    const titles = docsAtEnd.map(r => r.title)

    expect(titles).not.toContain(docToDelete.title)
  })
})


describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
    
      const user = new User({ 

        username: 'root',
        email: "email@gmail.com", 
        passwordHash,
        admin: true})
  
      await user.save()
    })
  
  let loggedUser;
  describe('login', () => {
    test('succeeds with valid data', async () => {
      const usersAtEnd = await helper.usersInDb()
      const user = usersAtEnd[0]

      const result = await api
        .post("/api/login")
        .send({email: user.email, password: "sekret"})
        .expect(200)
      
      loggedUser = result._body


    }, 10000)
  })
  
    test('creation succeeds with a fresh email', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        email: 'anewemail@gmail.com',
        name: 'jhon',
        password: 'a',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const emails = usersAtEnd.map(u => u.email)
      expect(emails).toContain(newUser.email)
    })

    test('creation fails with proper statuscode and message if email already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        email: "email@gmail.com",
        name: 'Superuser',
        password: 'salainen',
      }
  
      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain("an account with this email already exists")
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toEqual(usersAtStart)
    })



})


afterAll(() => {
    mongoose.connection.close()
  })
  