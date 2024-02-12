const mongoose = require('mongoose')
const yup = require('yup')
const debug = require('debug')('User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { Task } = require('./Task')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 4,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 20,
    },
    age: {
      type: Number,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: { type: Buffer },
  },

  {
    timestamps: true,
  }
)

const validationSchema = yup.object().shape({
  name: yup.string().min(4).max(50).required().trim().lowercase(),
  email: yup.string().email().required().trim().lowercase(),
  password: yup.string().min(6).max(20).required().trim(),
  age: yup.number().required().integer().positive(),
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
})

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
  // concat works fine so do push
  // user.tokens.push({token})

  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

userSchema.methods.toJSON = function () {
  const user = this
  // *One way of copying
  // const userObject = { ...user._doc }
  // *Another way of copying

  // *To convert BSON to JSON
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  // debug('userObject', userObject)
  return userObject
}

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
  const user = this
  // debug('password', user.password)
  // debug(user.password.length)
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})
const User = mongoose.model('User', userSchema)

module.exports = { User, validationSchema }
