const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

const sendWlcmMsg = async ({ email, name }) => {
  const msg = {
    to: email,
    from: 'erarun1nly1@gmail.com',
    subject: 'Thanks for joining in task app created by Arun Chapagain',
    text: `Welcome to the app, ${name}. This is an email send through Node on testing. Let me know how you are doing`,
  }

  await sgMail.send(msg)
}

const sendCancellationMsg = async ({ email, name }) => {
  const msg = {
    to: email,
    from: 'erarun1nly1@gmail.com',
    subject: 'Sorry to see you go!',
    text: `Goodbye,${name}. I hope to see you some time soon.`,
  }

  await sgMail.send(msg)
}
module.exports = { sendWlcmMsg, sendCancellationMsg }
