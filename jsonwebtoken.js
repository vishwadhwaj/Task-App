const jwt = require('jsonwebtoken')
const debug = require('debug')('jsonwebtoken')

const myFunction = async () => {
  const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', {
    expiresIn: '7 days',
  })
  debug(token)

  const data = jwt.verify(token, 'thisismynewcourse')
  debug(data)
}
// myFunction()

// Spread...
const num = [1, 2, 3, 4, 5]

const num2 = [...num, { sum: 0 }]
debug(num2)

// Rest
const showSum = (number) => (a, b) => (a + b) * number
debug(showSum(2)(4, 9))

const obj1 = {
  name: 'arun',
  age: 26,
  address: 'Pharping',
}

obj1.toJSON = function () {
  return this.age
}

debug(obj1)
debug(JSON.stringify(obj1))
