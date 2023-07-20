// Import required modules and files
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse, createTokenUser } = require('../utils')

// Register user
const register = async (req, res) => {
  const { email, name, password } = req.body
  // Check if email already exists
  const emailAlreadyExists = await User.findOne({ email })
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists')
  }

  // Determine user role (first registered user is an admin)
  const isFirstAccount = (await User.countDocuments({})) === 0
  const role = isFirstAccount ? 'admin' : 'user'

  // Create user
  const user = await User.create({ name, email, password, role })

  // Generate token for the user
  const tokenUser = createTokenUser(user)

  // Attach token to response cookies
  attachCookiesToResponse({ res, user: tokenUser })
  // Send response with created user
  res.status(StatusCodes.CREATED).json({ user: tokenUser })
}
// User login
const login = async (req, res) => {
  const { email, password } = req.body

  // Check if email and password are provided
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password')
  }
  // Find user by email
  const user = await User.findOne({ email })

  // Check if user exists
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  // Compare password
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }
  // Generate token for the user
  const tokenUser = createTokenUser(user)
  // Attach token to response cookies
  attachCookiesToResponse({ res, user: tokenUser })

  // Send response with logged-in user
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

// User logout
// note about the clearCookie function
const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    expires: new Date(),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: 'none'
  })
  // Send response
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' })
}

module.exports = { register, login, logout }
