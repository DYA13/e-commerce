const express = require('express')
const router = express.Router()

const { register, login, logout } = require('../controllers/authController')

//This sets up a POST route for the "/register" endpoint. When a request is made to this endpoint, the register function from the authController will be executed.
router.post('/register', register)
//This sets up a POST route for the "/login" endpoint. When a request is made to this endpoint, the login function from the authController will be executed.
router.post('/login', login)
//his sets up a GET route for the "/logout" endpoint. When a request is made to this endpoint, the logout function from the authController will be executed.
router.get('/logout', logout)

module.exports = router
