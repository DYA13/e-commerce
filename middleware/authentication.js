const CustomErr = require('../errors')
const { isTokenValid } = require('../utils')

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token

  if (!token) {
    throw new CustomErr.UnauthenticatedError('Authenticated Invalid')
  }
  try {
    const payload = isTokenValid({ token })
  } catch (error) {}

  next()
}

module.exports = {
  authenticateUser
}
