const debug = require('debug')('taskRoute')
const express = require('express')

const { validateRequest } = require('../middleware/validateRequest')
const { validationSchema, Task } = require('../model/Task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post(
  '/tasks',
  [auth, validateRequest(validationSchema)],
  async (req, res) => {
    const newTask = new Task({ ...req.body, owner: req.user._id })
    try {
      await newTask.save()
      res.status(201).send({ status: 'Success', newTask })
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

// GET /tasks?completed=true
// limit skip
// GET /tasks?limit=10&skip=0
// GET /tasks/?sortBy=createAt_asc/createdAt_desc
router.get('/tasks', auth, async (req, res) => {
  const { completed, limit, skip, sortBy } = req.query
  const match = {}
  const sort = {}
  if (sortBy) {
    const parts = sortBy.split('_')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  if (completed === 'true') {
    match.completed = true
  }
  if (completed === 'false') {
    match.completed = false
  }
  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: limit ? +limit : 0,
        skip: skip ? +skip : 0,
        sort,
      },
    })

    res.status(200).send({ status: 'success', tasks: req.user.tasks })
  } catch (error) {
    res
      .status(500)
      .json({ status: 'Failed to fetch task', error: error.message })
  }
})

// router.get('/tasks', auth, async (req, res) => {
//   try {
//     // *One way
//     // const tasks = await Task.find({ owner: req.user._id })

//     // *Another way
//     await req.user.populate('tasks')

//     // if (tasks.length < 1) {
//     //   return res.status(404).send({ status: 'No task found' })
//     // }
//     res.status(200).send(req.user.tasks)
//   } catch (error) {
//     res
//       .status(500)
//       .json({ status: 'Failed to fetch task', error: error.message })
//   }
// })

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    // const task = await Task.findById(id)

    const task = await Task.findOne({ _id: id, owner: req.user._id })

    if (!task) return res.status(400).send({ message: 'Cannot find task' })
    res.status(200).send({ status: 'Success', task })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error: error.message })
  }
})

router.patch(
  '/tasks/:id',
  [validateRequest(validationSchema), auth],
  async (req, res) => {
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    )
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates' })
    }
    try {
      const { id } = req.params
      // const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
      //   new: true,
      //   runValidators: true,
      // })

      const oldTask = await Task.findOne({ _id: id, owner: req.user._id })
      if (!oldTask) {
        return res
          .status(404)
          .send({ status: 'Failed', message: 'Task not found' })
      }
      updates.forEach((update) => {
        return (oldTask[update] = req.body[update])
      })

      const updatedTask = await oldTask.save()
      if (!updatedTask) {
        return res.status(400).send({ error: 'Cannot update the task!' })
      }
      res.status(200).json({ status: 'Success', updatedTask })
    } catch (error) {}
  }
)

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    })
    if (!deletedTask) {
      return res
        .status(404)
        .send({ status: 'Failed', message: 'cannot delete the task' })
    }
    res.status(200).send({ status: 'Successfully deleted task!', deletedTask })
  } catch (error) {
    res.status(500).send({ status: 'Failed', error })
  }
})
module.exports = router
