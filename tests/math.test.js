const {
  calculateTip,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  add,
} = require('../src/math')

test('Should calcualte total with tip', () => {
  expect(calculateTip(10, 0.3)).toBe(13)
  //   if (total != 13) {
  //     throw new Error('Total tip should be 13. It is ' + total)
  //   }
})

test('Should calculate total with default tip', () => {
  expect(calculateTip(10)).toBe(12.5)
})

test('Should convert fahrenheit to celsius', () => {
  expect(fahrenheitToCelsius(32)).toBe(0)
})

test('Should convert celsius to fahrenheit', () => {
  expect(celsiusToFahrenheit(0)).toBe(32)
})

test('Async test demo', (done) => {
  setTimeout(() => {
    expect(1).toBe(1)
    done()
  }, 2000)
})

test('Should add two numbers', (done) => {
  add(1, 1).then((sum) => {
    expect(sum).toBe(2)
    done()
  })
})

test('Should add two number async/await', async () => {
  const sum = await add(4, 5)
  expect(sum).toBe(9)
})
