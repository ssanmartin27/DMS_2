const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const body = request.body
  const mail = body.email


  const existingEmail = await User.findOne({email: mail})


  if (existingEmail) {
    return response.status(400).json({
        error: "an account with this email already exists"
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    name: body.name,
    lastName: body.lastName,
    email: body.email,
    username: body.username,
    passwordHash: passwordHash,
    address: body.address,
    address2: body.address2,
    country: body.country,
    state: body.state,
    city: body.city,
    zip: body.zip,
    admin: false
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get("/", async (request, response) => {
    const users = await User.find({}).populate("transactions")
    response.json(users)
})

module.exports = usersRouter