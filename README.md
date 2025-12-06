# AI__POWERED_RFP_MNGMNT_SYTEM
A full-stack app that helps procurement managers create RFPs from natural language, manage vendors, send RFPs by email, ingest vendor replies, extract structured data from messy responses using an LLM, and compare proposals with AI-assisted scoring and recommendations.

#project setup
a.Prerequisites :
-Node.js v18+ 
-PostgreSQL (pgAdmin)
-OpenAI API key
-SMTP and IMAP credentials for receiving email
-VisualStudioCode

b.install setup
FRONT-END:
-npm create vite@latest frontend(react + javascript(.jsx))
-cd frontend
-npm install(also install axios,cors etc)
-npm run dev
BACK-END:
-cd backend
-npm install
-node server.js
#How to configure email sending/receiving.
-SMTP (sending): provide SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS. If using Gmail, enable App Passwords and use SMTP user = your Gmail.
-IMAP (receiving): provide IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS. The backend runs a short poller or webhook to fetch new messages.
-add it in environment variable(.env)..given sample in .env.example
 #How to run everything locally
 -clone repository: gin clone url: cd your repo
 -set up the environmenta variable(.env) in backend
 -make sure to create db name in ur postgreSQLMake sure your postgres is running.Fill the required values DB Credentials, SMTP/IMAP, OpenAPI key, Server Port. Install the dependencies.
 -cd backend
 -node server.js
 and then run frontend
 -cd frontend and install the dependencies
 -npm run dev
 #example seed data plan using postman
 -for vendors :POST → http://localhost:5000/api/vendors with json body {
  "name": "ABC Technologies",
  "email": "abc@example.com"
}

#TECH STACK
-Frontend: React + Vite with javascript(JSX), React Router, Axios
-Backend: Node.js, Express.js, nodemailer (SMTP), imap-simple (or similar) for IMAP polling
-DB: PostgreSQL (pgAdmin)
-AI provider: OpenAI (GPT family) — used to parse NL → structured RFP, extract proposal fields, and score/compare proposals
-Key libraries: express, pg, nodemailer, axios, dotenv, cors, imap-simple (or mailparser)

#API DOCUMENTATION
-Base URL: http://localhost:5000/api
  RFP: 
-create:POST http://localhost:5000/api/rfps
-get by id : GET http://localhost:5000/api/RFPS/:id
-list :GET http://localhost:5000/api/rfps
-evaluate : GET http://localhost:5000/api/evaluate
- delete : DELETE http://localhost:5000/api/rfp/:id
  VENDORS:
- create vendors : POST http://localhost:5000/api/vendors
- list: GET http://localhost:5000/api/vendors
- delete : DELETE http://localhost:5000/api/vendors/:id
  PROPOSALS:
  - create : POST: http://localhost:5000/api/proposals
  - get by rfpid: GET http://localhost:5000/api/proposals/rfp/:rfpId
  - get by vendorId : GET http://localhost:5000/api/proposals/vendor/:vendorId
  - delete : DELETE http://localhost:5000/api/proposals/:id
  EMAILS:
- send email : POST http://localhost:5000/api/email/send-test
- receive emails: GET http://localhost:5000/api/email/fetch-emails
EXAMPLE :
 create rfps: POST http://localhost:5000/api/rfps
json body/request body: {
  "description": "I need to procure 20 computer for our new office. Budget $100,000, delivery in 30 days"
}
response body success:{
    "id": 14,
    "title": "Office Computer Procurement",
    "description": "I need to procure 20 computer for our new office. Budget $100,000, delivery in 30 days",
    "category": "Office Computer Procurement",
    "budget": "$100,000",
    "status": "created",
    "structuredData": {
        "title": "Office Computer Procurement",
        "budget": "$100,000",
        "summary": "Procurement of 20 computers for the new office.",
        "timeline": "30 days",
        "requirements": [
            "20 computers",
            "Delivery within 30 days"
        ]
    }

}
error response body: {
    "error": "Cannot destructure property 'description' of 'req.body' as it is undefined."
}
#Decisions & assumptions (brief explanations)
1. Key design decisions
-RFP model (structured JSON): items list, quantity, specs, budget, delivery timeline, payment terms, warranty.
-Why: This covers typical procurement needs and is easy to map to vendor responses.
-Proposal parsing flow: raw email → pre-process (strip HTML/attachments text) → LLM extraction prompt → normalized fields stored in DB.
-Why: Keeps parsing logic LLM-centric and simplifies downstream comparison.
-Scoring: Weighted score using normalized price (inverse), delivery time, warranty, and completeness (fields provided). Final score = weighted average (tunable).
-Why: Transparent and explainable scoring; easy to tweak weights.
2 Assumptions & limitations
-Vendors generally include price, delivery, warranty in replies. If omitted, marked as “not provided.”
-Attachments (PDF/Excel) are out-of-scope for first pass unless text-extracted server-side; you can extend with OCR/Tabular parsers.
-Email replies come to a single monitored inbox. Multi-inbox support is possible but not implemented.
-LLM may hallucinate — system validates numeric fields and flags suspicious outputs for manual review

#AI tools usage (brief)
-1 Tools used
OpenAI (GPT-4 / GPT-4o-mini) — main LLM for parsing and recommendations.
ChatGPT (for design & prompt iteration) —system architecture , prompt engineering, example formats, edge cases.
cursor ai for debugging and styles to the UI
-2 What they helped with
Parsing prompts: Developing robust prompts to extract price, delivery, warranty, and optional fields from messy text.
Comparison logic: Writing prompt templates to ask the LLM to rank vendors given parsed fields.

- Example prompts (short)
NL → RFP
“Convert this procurement request into JSON with fields: items, qty, specs, budget, delivery_days, payment_terms. Return JSON only.”
Email parsing
“Extract price, currency, delivery days, warranty, and model name from this email. If a field is missing return null.”
Comparison
“Given proposals (JSON list), score each from 0–10 based on price, delivery, warranty, spec match; return scores and short reason.”
- What I learned / changes due to AI tools
  - provide field examples and explicit formats.
-Always validate numeric outputs (price/days) after model returns them.
-Use simple fallback rules (e.g., if price not found, prompt user) to ensure safety.
-AI integration and email parsing
