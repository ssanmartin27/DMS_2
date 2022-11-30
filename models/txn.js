const mongoose = require('mongoose')

const txnSchema = new mongoose.Schema({
    doc: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doc'
    },
    date: Date,
    format: {
        type: String,
        enum: ["virtual", "physical"]
    },
    type: {
        type: String,
        enum: ["purchase", "rent"]
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expDate : Date,
    complete: Boolean,
    total: Number
    
})

txnSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
  
module.exports = mongoose.model('Txn', txnSchema)