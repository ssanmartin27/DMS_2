const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  name: String,
  lastName: String,
  address: String,
  address2: String,
  country: String,
  state: String,
  city: String,
  zip: String,
  passwordHash: String,
  admin: Boolean,
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Txn'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User