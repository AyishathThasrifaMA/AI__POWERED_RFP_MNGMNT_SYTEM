import axios from "axios";

const API = "http://localhost:5000/api/email";

export const sendEmail = async (to, subject, body) =>
  (await axios.post(`${API}/send-test`, { to, subject, body })).data;

export const fetchEmails = async (fromEmail) =>
  (await axios.get(`${API}/fetch-emails`, { params: { from: fromEmail } })).data;