const txnsRouter = require("express").Router()
const Txn = require("../models/txn")
const jwt = require('jsonwebtoken')
const Doc = require("../models/doc")
const User = require("../models/user")

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  console.log(authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

txnsRouter.post('/', async (request, response, next) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  
  const user = await User.findById(body.user)
  const doc = await Doc.findById(body.doc)

  const txn = new Txn({
    client: user._id,
    doc: doc._id,
    format: body.format,
    type: body.type,
    complete: body.complete,
    total: body.type === "rent" ? 10000: doc.price
  })

  const savedTxn = await txn.save()
  user.transactions = user.transactions.concat(savedTxn._id)
  await user.save()
  
  response.json(savedTxn)

})

txnsRouter.get("/", async (request, response) => {
  const txns = await Txn.find({}).populate("client").populate("doc")
  response.json(txns)
})

txnsRouter.get("/date", async (request, response) => {
  const date = new Date()
  response.json(date)
})

txnsRouter.get('/:id', (request, response, next) => {
  Txn.findById(request.params.id)
    .then(txn => {
      if (txn) {  
        response.json(txn)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

txnsRouter.delete('/:id', (request, response, next) => {

  Txn.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})


txnsRouter.patch('/:id', (request, response, next) => {
  const body = request.body
  const date = new Date()
  const expDate = new Date(date)
  expDate.setDate(expDate.getDate() + 7)
  const txn = {
        complete: true,
        date: date,
        expDate: expDate
   }

  Txn.findByIdAndUpdate(request.params.id, txn, {runValidators: true, context: 'query'})
    .then(updatedDoc => {
      response.json(updatedDoc)
      console.log(updatedDoc)
    })
    .catch(error => next(error))
})

module.exports = txnsRouter

