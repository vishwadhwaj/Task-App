const mongoose = require('mongoose')
const yup = require('yup')
const debug = require('debug')('taskModel')
const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

const validationSchema = yup.object().shape({
  description: yup.string().required(),
  completed: yup.boolean(),
})

const Task = mongoose.model('Task', taskSchema)

module.exports = { Task, validationSchema }
