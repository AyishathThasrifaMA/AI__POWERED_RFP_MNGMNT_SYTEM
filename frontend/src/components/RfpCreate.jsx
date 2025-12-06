import React, { useState } from "react";
import { createRFP } from "../api/rfpApi";

export default function RfpCreate({ onCreated }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!text.trim()) {
      alert("Please enter a description");
      return;
    }
    setLoading(true);
    try {
      const rfp = await createRFP(text);
      setText("");
      if (onCreated) onCreated(rfp);
    } catch (error) {
      console.error("Error creating RFP:", error);
      alert("Failed to create RFP: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Create RFP (AI Powered)</h2>
        <p className="text-muted">Describe your procurement needs and let AI generate a structured RFP for you.</p>
      </div>
      
      <div className="form-group">
        <label className="form-label">Procurement Description:</label>
        <textarea
          className="form-textarea"
          rows={6}
          placeholder="Example: We need to purchase 50 laptops for our new office. Budget is around $50,000. We need them delivered within 2 weeks. Looking for reliable brands with good warranty..."
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
      </div>

      <button 
        className="btn btn-primary" 
        onClick={submit} 
        disabled={loading}
      >
        {loading ? "Creating RFP..." : "✨ Generate RFP with AI"}
      </button>
    </div>
  );
}