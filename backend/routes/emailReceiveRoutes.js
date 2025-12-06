const express = require("express");
const router = express.Router();
const { fetchEmails } = require("../controllers/emailReceiveController");

router.get("/fetch-emails", fetchEmails);

module.exports = router;
