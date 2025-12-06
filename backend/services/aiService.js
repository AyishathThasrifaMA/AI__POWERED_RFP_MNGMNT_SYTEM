require("dotenv").config();
const OpenAI = require("openai");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("❌ Missing OPENAI_API_KEY in .env file");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function safeOpenAIRequest(messages) {
  try {
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }
    
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content 
    }));
    
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: formattedMessages
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("\n🔥 OpenAI Error:");
    console.error("Status:", err.status || "N/A");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);

    return JSON.stringify({
      error: "AI request failed",
      details: err.message
    });
  }
}

async function generateRfpStructure(text) {
  const messages = [
    {
      role: "system",
      content: `
You must return STRICT JSON with the following fields:

{
  "title": "Short clear project title",
  "summary": "1 sentence summary",
  "requirements": ["req1", "req2"],
  "budget": "number or string",
  "timeline": "expected timeline"
}

Never return text outside JSON. Never leave title empty.
      `
    },
    { role: "user", content: text }
  ];

  const aiOutput = await safeOpenAIRequest(messages);

  try {
    const json = JSON.parse(aiOutput);
    if (!json.title) json.title = "Untitled RFP";
    return json;
  } catch {
    return {
      title: "Untitled RFP",
      error: "Invalid AI JSON",
      raw: aiOutput
    };
  }
}

async function parseVendorProposal(text) {
  const messages = [
    {
      role: "system",
      content: `
Extract proposal details and return STRICT JSON format:

{
  "vendorName": "",
  "solutionSummary": "",
  "cost": "",
  "timeline": "",
  "warranty": "",
  "strengths": [],
  "weaknesses": []
}

IMPORTANT: Extract warranty information from the text. Look for phrases like "2-year warranty", "warranty period", "guarantee", etc. If warranty is mentioned in the summary or text, extract it explicitly. If no warranty is mentioned, return empty string "".

Never return non-JSON.
      `
    },
    { role: "user", content: text }
  ];

  const aiOutput = await safeOpenAIRequest(messages);

  try {
    const parsed = JSON.parse(aiOutput);
    if (!parsed.warranty && parsed.solutionSummary) {
      const warrantyMatch = parsed.solutionSummary.match(/(\d+[-\s]?(year|month|yr|mo)[\s-]?warranty|warranty[\s:]+(\d+[-\s]?(year|month|yr|mo)))/i);
      if (warrantyMatch) {
        parsed.warranty = warrantyMatch[0];
      }
    }
    return parsed;
  } catch {
    return {
      error: "Invalid AI JSON",
      raw: aiOutput
    };
  }
}

async function evaluateProposals(proposals, rfpRequirements = null) {
  if (!Array.isArray(proposals)) {
    proposals = [];
  }
  
  if (proposals.length === 0) {
    return {
      bestProposal: null,
      summary: "No proposals to evaluate",
      scores: []
    };
  }
  
  let contextText = "Evaluate and compare these vendor proposals:\n\n";
  
  if (rfpRequirements) {
    contextText += `RFP Requirements:\n${JSON.stringify(rfpRequirements, null, 2)}\n\n`;
  }
  
  contextText += "Proposals to Evaluate:\n";
  proposals.forEach((p, i) => {
    contextText += `\nProposal ${i + 1} - ${p.vendorName || 'Unknown Vendor'}:\n`;
    contextText += JSON.stringify(p.content || p, null, 2);
    contextText += "\n";
  });

  const messages = [
    {
      role: "system",
      content: `
You are an expert RFP evaluator. Analyze and compare these proposals based on:
- Price/Value
- Technical solution quality
- Timeline/delivery
- Vendor experience
- Risk factors

Return STRICT JSON format (no markdown, no code blocks):

{
  "bestProposal": "<exact vendorName from proposals>",
  "summary": "2-3 sentence summary comparing all proposals and explaining the recommendation",
  "scores": [
    {
      "vendorName": "<exact vendorName>",
      "score": 85,
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "recommendation": "brief recommendation note"
    }
  ],
  "comparison": {
    "priceLeader": "<vendorName>",
    "qualityLeader": "<vendorName>",
    "fastestDelivery": "<vendorName>"
  }
}

Scores should be 0-100. Never return anything other than valid JSON.
      `
    },
    { role: "user", content: contextText }
  ];

  const aiOutput = await safeOpenAIRequest(messages);

  try {
    const result = JSON.parse(aiOutput);
    if (!result.scores) result.scores = [];
    if (!result.summary) result.summary = "Evaluation completed";
    if (!result.bestProposal) result.bestProposal = proposals[0]?.vendorName || "Unknown";
    return result;
  } catch (parseError) {
    console.error("Failed to parse AI evaluation:", parseError);
    console.error("Raw AI output:", aiOutput);
    return {
      error: "Invalid AI JSON response",
      summary: "Failed to parse evaluation results",
      scores: proposals.map(p => ({
        vendorName: p.vendorName || "Unknown",
        score: 0,
        strengths: [],
        weaknesses: []
      })),
      raw: aiOutput
    };
  }
}

module.exports = {
  parseRFP: generateRfpStructure,
  parseProposal: parseVendorProposal,  
  evaluateProposals                      
};
