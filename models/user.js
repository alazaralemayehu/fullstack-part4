const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: 3,
  },
     name: String,
     passwordHash: String,
     blogs: [
         {
             type: mongoose.Schema.ObjectId,
             ref: 'Blog'
         }
     ],
 })

 usersSchema.set('toJSON', {
     transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v

        delete returnedObject.passwordHash
     }
 })


usersSchema.plugin(uniqueValidator)


const User = mongoose.model('User',usersSchema)

module.exports = User