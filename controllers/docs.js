const jwt = require('jsonwebtoken')
const docsRouter = require("express").Router()
const multer  = require('multer')
const Doc = require("../models/doc")
const User = require("../models/user")
const fs = require("fs")

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({storage: multerStorage });

const fUpload = upload.fields([{ name: "pdf", maxCount: 1 }, { name: "image", maxCount: 1 }])

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  console.log(authorization)
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

docsRouter.post('/', fUpload, async (request, response, next) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  if (!user.admin) {
    return response.status(401).json({ error: 'No admin access' })
  }

  const doc = new Doc({
     title: body.title,
     description: body.description,
     pdf: request.files["pdf"][0].filename,
     file: (!request.files["image"]) ? "doc.png" : request.files["image"][0].filename, 
     price : body.price,
     doc_type: body.doc_type,
     physical_copies : body.physical_copies,

  })

  doc.save()
    .then(savedDoc => {
    response.status(201).json(savedDoc)
    })
    .catch(error => next(error))
})

docsRouter.get("/", (request, response) => {
  Doc.find({}).then(docs => {
    response.json(docs)
  })
})

docsRouter.get('/:id', (request, response, next) => {
  Doc.findById(request.params.id)
    .then(doc => {
      if (doc) {  
        response.json(doc)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

docsRouter.delete('/:id', (request, response, next) => {

  Doc.findByIdAndRemove(request.params.id)
    .then(result => {
      fs.unlink(`public/uploads/${result.pdf}`, ()=>{})
      if (result.file !== "doc.png")
      {fs.unlink(`public/uploads/${result.file}`, ()=>{})}
      response.status(204).end()
    })
    .catch(error => next(error))
})

const fUpload2 = upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'image', maxCount: 1 }])
docsRouter.put('/:id', fUpload2, (request, response, next) => {
  const body = request.body
  if (request.files["pdf"]) {
    fs.unlink(`public/uploads/${body.origpdf}`, ()=>{})
  }
  if (request.files["image"] && body.origimage !== "doc.png") {
    fs.unlink(`public/uploads/${body.origimage}`, ()=>{})
  }
  const doc = {
    title: body.title,
    description: body.description,
    pdf: (!request.files["pdf"]) ? body.origpdf : request.files["pdf"][0].filename, 
    file: (!request.files["image"]) ? body.origimage : request.files["image"][0].filename, 
    price : body.price,
    doc_type: body.doc_type,
    physical_copies : body.physical_copies
   }

  Doc.findByIdAndUpdate(request.params.id, doc, { new: true , runValidators: true, context: 'query'})
    .then(updatedDoc => {
      response.json(updatedDoc)
      console.log(updatedDoc)
    })
    .catch(error => next(error))
})

module.exports = docsRouter
