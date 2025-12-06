import React, { useState } from "react";
import { fetchEmails } from "../api/emailApi";

export default function ReceiveEmails() {
  const [fromEmail, setFromEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFetch = async (e) => {
    e.preventDefault();
    
    if (!fromEmail.trim()) {
      setMessage({ type: "error", text: "Please enter an email address" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });
    setEmails([]);

    try {
      const result = await fetchEmails(fromEmail);
      if (result.success) {
        setEmails(result.emails || []);
        if (result.emails && result.emails.length === 0) {
          setMessage({ type: "info", text: "No emails found from this sender" });
        } else {
          setMessage({ 
            type: "success", 
            text: `Found ${result.emails.length} email(s)` 
          });
        }
      } else {
        setMessage({ type: "error", text: result.error || "Failed to fetch emails" });
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.error || error.message || "Failed to fetch emails" 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Receive Emails</h2>
        <p className="text-muted">Fetch and view emails from a specific sender's email address.</p>
      </div>

      <form onSubmit={handleFetch} style={{ marginBottom: "2rem" }}>
        <div className="form-group">
          <label className="form-label">From Email Address:</label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <input
              type="email"
              className="form-input"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="sender@example.com"
              required
              style={{ flex: 1, maxWidth: "400px" }}
            />
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? "Fetching..." : "📥 Fetch Emails"}
            </button>
          </div>
        </div>
      </form>

      {message.text && (
        <div className={`alert alert-${message.type === "success" ? "success" : message.type === "info" ? "info" : "error"}`}>
          {message.text}
        </div>
      )}

      {emails.length > 0 && (
        <div>
          <h3>Emails ({emails.length})</h3>
          <div className="grid grid-2">
            {emails.map((email, index) => (
              <div key={index} className="list-item">
                <div className="list-item-header">
                  <h3 className="list-item-title">{email.subject || "No Subject"}</h3>
                </div>
                <div className="list-item-meta">
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>From:</strong> {email.from || "N/A"}
                  </div>
                  <div style={{ marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    <strong>Date:</strong> {formatDate(email.date)}
                  </div>
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem",
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--border-radius)",
                      whiteSpace: "pre-wrap",
                      maxHeight: "200px",
                      overflowY: "auto",
                      fontSize: "0.875rem"
                    }}
                  >
                    <strong>Content:</strong>
                    <div style={{ marginTop: "0.5rem" }}>
                      {email.text || "No content"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
