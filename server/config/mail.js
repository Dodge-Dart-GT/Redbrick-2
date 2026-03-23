// Inside server/config/mail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "send.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "api", 
    pass: process.env.MAILTRAP_TOKEN 
  }
});

module.exports = transporter;