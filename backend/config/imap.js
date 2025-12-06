require("dotenv").config();
const imaps = require("imap-simple");

const config = {
  imap: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 5000,
    tlsOptions: { rejectUnauthorized: false }
  }
};

async function connectIMAP() {
  return await imaps.connect({ imap: config.imap });
}

module.exports = connectIMAP;
