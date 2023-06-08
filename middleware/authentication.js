const CustomErr = require('../errors')
const { isTokenValid } = require('../utils')

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token

  if (!token) {
    throw new CustomErr.UnauthenticatedError('Authenticated Invalid')
  }
  try {
    const { name, userId, role } = isTokenValid({ token })
    req.user = { name, userId, role }
    next()
  } catch (error) {
    throw new CustomErr.UnauthenticatedError('Authenticated Invalid')
  }
}

module.exports = {
  authenticateUser
}
