const express = require('express')
const router = express.Router()

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword
} = require('../controllers/userController')

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)

module.exports = router
