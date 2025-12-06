const transporter = require('../config/email');

async function sendRFP(toEmail, subject, body) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject,
    text: body,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendRFP };
