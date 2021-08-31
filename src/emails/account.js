const sgMail = require('@sendgrid/mail')
const sendGridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridAPIKey)

const sendWelcomeEmail = (email, name) => {
    const msg = {
        to: email, // Change to your recipient
        from: 'jose.krranza@gmail.com', // Change to your verified sender
        subject: 'Thanks for joining in',
        text: `Welcome to the app, ${name}, Let me know how you get along with the app`
    }
    sgMail.send(msg)
}

const sendCancelationEmail = (email, name) => {
    const msg = {
        to: email,
        from: 'jose.krranza@gmail.com', // Change to your verified sender
        subject: 'Sorry to see you go',
        text: `Goodbye ${name}, We hope to see you back sometime soon!`
    }
    sgMail.send(msg)
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}