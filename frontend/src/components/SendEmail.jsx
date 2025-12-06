import React, { useState, useEffect } from "react";
import { sendEmail } from "../api/emailApi";
import { listRFPs } from "../api/rfpApi";
import { listVendors } from "../api/vendorApi";

export default function SendEmail() {
  const [form, setForm] = useState({
    to: "",
    subject: "",
    body: ""
  });
  const [rfps, setRfps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rfpsData, vendorsData] = await Promise.all([
        listRFPs(),
        listVendors()
      ]);
      setRfps(rfpsData || []);
      setVendors(vendorsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!form.to || !form.subject || !form.body) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await sendEmail(form.to, form.subject, form.body);
      setMessage({ 
        type: "success", 
        text: result.message || "Email sent successfully!" 
      });
      setForm({ to: "", subject: "", body: "" });
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.error || error.message || "Failed to send email" 
      });
    } finally {
      setLoading(false);
    }
  };

  const fillRFPBody = (rfp) => {
    const rfpText = `
RFP Title: ${rfp.title || "N/A"}
Description: ${rfp.description || "N/A"}
Budget: ${rfp.budget || "Not specified"}
Category: ${rfp.category || "General"}

Please review the above RFP and submit your proposal.
    `.trim();
    
    setForm({
      ...form,
      subject: `RFP Request: ${rfp.title || "New RFP"}`,
      body: rfpText
    });
  };

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Send RFP Email</h2>
        <p className="text-muted">Compose and send RFP requests to vendors via email.</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === "success" ? "success" : "error"}`}>
          {message.text}
        </div>
      )}

      <div className="card" style={{ background: "var(--bg-tertiary)", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Quick Fill Options</h3>
        
        <div className="form-group">
          <label className="form-label">Select RFP to Auto-Fill:</label>
          <select
            className="form-select"
            onChange={(e) => {
              const selectedRfp = rfps.find(r => r.id === parseInt(e.target.value));
              if (selectedRfp) fillRFPBody(selectedRfp);
            }}
          >
            <option value="">Choose an RFP to auto-fill...</option>
            {rfps.map((rfp) => (
              <option key={rfp.id} value={rfp.id}>
                {rfp.title || `RFP #${rfp.id}`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Select Vendor:</label>
          <select
            className="form-select"
            onChange={(e) => {
              const selectedVendor = vendors.find(v => v.id === parseInt(e.target.value));
              if (selectedVendor) {
                setForm({ ...form, to: selectedVendor.email });
              }
            }}
          >
            <option value="">Choose a vendor...</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name} ({vendor.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSend}>
        <div className="form-group">
          <label className="form-label">To (Email Address):</label>
          <input
            type="email"
            className="form-input"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            placeholder="vendor@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Subject:</label>
          <input
            type="text"
            className="form-input"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="RFP Request: [Project Name]"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email Body:</label>
          <textarea
            className="form-textarea"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Enter email content here..."
            rows={12}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Sending..." : "📧 Send Email"}
        </button>
      </form>
    </div>
  );
}
