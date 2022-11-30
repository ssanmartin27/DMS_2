const Doc = require('../models/doc')
const User = require('../models/user')

const initialDocs = [
    {
        title: "Crime and punishment",
        description: "By Dostoievsky",
        pdf: "crimeAndPunishment.pdf",
        file: "doc.png",
        price : 20000,
        doc_type: "Book",
        physical_copies : 5
    },
    {
        title: "Introduction to quantum mechanics",
        description: "Vol. 1",
        pdf: "QM.pdf",
        file: "doc.png",
        price : 30000,
        doc_type: "Investigation",
        physical_copies : 1
    },
]

const nonExistingId = async () => {
    const doc = new Doc({
        title: "New Title",
        pdf: "test.pdf",
        price : 30000,
        doc_type: "Investigation",
     })
    await doc.save()
    await doc.remove()
  
    return doc._id.toString()
  }
  
  const docsInDb = async () => {
    const docs = await Doc.find({})
    return docs.map(doc => doc.toJSON())
  }

  const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
  }
  
  module.exports = {
    initialDocs,
    nonExistingId,
    docsInDb,
    usersInDb,
  }
  