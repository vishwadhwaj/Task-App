const express = require('express')
const debug = require('debug')('routes/tasks')
const multer = require('multer')
const sharp = require('sharp')

const { validateRequest } = require('../middleware/validateRequest')
const { validationSchema, User } = require('../model/User')
const auth = require('../middleware/auth')
const { sendWlcmMsg, sendCancellationMsg } = require('../emails/account')

const router = express.Router()

router.post('/users', validateRequest(validationSchema), async (req, res) => {
  try {
    const newUser = new User(req.body)
    const token = await newUser.generateAuthToken()
    // !No need to save user twice
    // const savedUser = await newUser.save()
    // if (!savedUser) {
    //   return res
    //     .status(400)
    //     .send({ status: 'Failed', message: 'Cannot create the user' })
    // }
    sendWlcmMsg(newUser)
    res
      .status(201)
      .send({ status: 'Success creating the  user ', newUser, token })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
})

router.get('/users/me', auth, async (req, res) => {
  debug(req)
  const user = req.user
  res.send({ status: 'success', user })
})

router.patch(
  '/users/me',
  [validateRequest(validationSchema), auth],
  async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    )

    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
      const oldUser = req.user
      updates.forEach((update) => (oldUser[update] = req.body[update]))
      const updatedUser = await oldUser.save()
      if (!updatedUser) {
        return res.status(404).send('Cannot update the user')
      }
      res.status(200).send({ status: 'success', updatedUser })
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    sendCancellationMsg(req.user)
    res.status(200).send({
      message: 'Successfully deleted',
    })
  } catch (error) {
    res.status(500).json({ status: 'Failed', error: error.message })
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findByCredentials(email, password)
    const token = await user.generateAuthToken()
    res.status(200).send({ status: 'Success', user, token })
  } catch (error) {
    res.status(400).send({ status: 'Failed', error: error.message })
    console.log(error)
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((t) => t.token !== req.token)
    await req.user.save()
    res.send({ status: 'Logged out' })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    req.user.save()
    res.status(200).send({ status: 'Successfully logged out of all devices' })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('Please upload an image'))
    }
    cb(null, true)
  },
})

router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).send({ status: 'success', user: req.user })
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message })
  }
)

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send({ status: 'success', user: req.user })
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error()
    }
    res.set('Content-Type', 'image/jpg')
    res.send(user.avatar)
  } catch (error) {
    res.status(404).send({ error: error.message })
  }
})

module.exports = router
