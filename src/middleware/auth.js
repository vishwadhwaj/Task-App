const debug = require('debug')('auth')
const jwt = require('jsonwebtoken')

const { User } = require('../model/User')

const auth = async (req, res, next) => {
  try {
    // debug(req.headers)
    // *One way of fetching token
    // let token = req.headers.authorization
    // token = token.split(' ')
    // const actualToken = token[1]
    // debug(actualToken)

    // *Another way of fetching token
    const token = req.headers.authorization.replace('Bearer ', '')
    if (!token) {
      throw new Error()
    }
    debug(token)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
    if (!user) {
      throw new Error()
    }
    req.token = token
    req.user = user
    next()
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' })
  }
}

module.exports = auth
