const connectIMAP = require("../config/imap");
const { simpleParser } = require("mailparser");

exports.fetchEmails = async (req, res) => {
  try {
    const senderEmail = req.query.from;
    if (!senderEmail) {
      return res.status(400).json({ success: false, error: "Missing 'from' query parameter" });
    }

    const connection = await connectIMAP();
    await connection.openBox("INBOX");
    const searchCriteria = [["FROM", senderEmail]];  
    const fetchOptions = { bodies: [""], markSeen: false };
    const messages = await connection.search(searchCriteria, fetchOptions);
    const emails = [];
    for (const msg of messages) {
      const all = msg.parts.find(p => p.which === "");
      const parsed = await simpleParser(all.body);

      emails.push({
        from: parsed.from?.text,
        subject: parsed.subject,
        text: parsed.text,
        date: parsed.date,
      });
    }

    res.json({ success: true, emails });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
