const debug = require('debug')('validateRequest')
const validateRequest = (validationSchema) => async (req, res, next) => {
  try {
    const result = await validationSchema.validate(req.body)
    debug('result', result)
    if (result) {
      req.body = result
    }
    next()
  } catch (error) {
    debug(error)
    res.status(400).json({
      status: 'Failed',
      message: error.message,
    })
  }
}

module.exports = { validateRequest }
