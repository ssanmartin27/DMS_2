const mongoose = require('mongoose')

const docSchema = new mongoose.Schema({
    file:  String,

    pdf: {
        type: String,
        required: true
    },

    title: {type: String, required: true},
    
    doc_type: {
      type: String,
      enum: ["Book", "Magazine", "Essay", "Monograph", "Iconography", "Investigation"],
      required: true
    },

    physical_copies: Number,

    description: String,

    price: {type: Number, required: true}
})

docSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Doc', docSchema)