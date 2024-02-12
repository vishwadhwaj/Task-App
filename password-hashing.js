const bcrypt = require('bcrypt')

const myFunction = async () => {
  const password = 'Red1234'
  const hashedPassword = await bcrypt.hash(password, 8)
  debug(password)

  debug(hashedPassword)
  debugger
  const isMatch = await bcrypt.compare(password, hashedPassword)
  debug('isMatch', isMatch)
}

myFunction()
