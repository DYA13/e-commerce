// import the required dependencies
//for MongoDB object modeling
const mongoose = require('mongoose')
//for email validation
const validator = require('validator')
//for password hashing
const bcrypt = require('bcryptjs')

//It defines the structure of a user document in MongoDB. The schema includes fields such as name, email, password, and role. Each field has a specified type and additional configurations like required fields, minimum and maximum lengths, uniqueness, and email validation using the validator library. The role field is set to have an enum with values 'admin' and 'user', and its default value is 'user'
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
})
//This code adds a pre-save middleware function to the UserSchema. The middleware is triggered before a user document is saved. Inside the middleware function, it checks if the password field has been modified. If it hasn't been modified, the function exits early. If it has been modified, it generates a salt using bcrypt.genSalt() with a complexity factor of 10 and then hashes the user's password using bcrypt.hash(). The resulting hashed password is stored back in the password field of the user document.
UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths())
  // console.log(this.isModified('name'))
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

//This code adds a method called comparePassword to the UserSchema. The method takes a candidatePassword as an argument and compares it with the hashed password stored in the user document. It uses bcrypt.compare() to perform the comparison and returns a boolean value indicating whether the passwords match or not.
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
