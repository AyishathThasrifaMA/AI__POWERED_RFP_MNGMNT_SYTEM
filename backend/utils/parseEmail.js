function extractTextFromEmail(emailRaw) {
  return emailRaw.replace(/<\/?[^>]+(>|$)/g, ""); 
}

module.exports = { extractTextFromEmail };


