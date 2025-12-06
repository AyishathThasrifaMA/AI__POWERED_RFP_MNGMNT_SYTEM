const express = require("express");
const router = express.Router();
const { sendRFP } = require("../services/emailService");

router.post("/send-test", async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    const result = await sendRFP(to, subject, body);

    res.json({
      success: true,
      message: "Email sent successfully!",
      details: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to send email",
      details: err.message
    });
  }
});

module.exports = router;
