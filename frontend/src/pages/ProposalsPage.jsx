import React, { useState, useEffect } from "react";
import { submitProposal } from "../api/proposalApi";
import { listRFPs } from "../api/rfpApi";
import { listVendors } from "../api/vendorApi";
import CompareProposals from "../components/CompareProposals";


export default function ProposalsPage() {
  const [form, setForm] = useState({
    rfpId: "",
    vendorId: "",
    rawEmail: ""
  });

  const [rfps, setRfps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRfpForComparison, setSelectedRfpForComparison] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setRfps(await listRFPs());
      setVendors(await listVendors());
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      // Ensure IDs are converted to integers (backend expects integers)
      const proposalData = {
        rfpId: parseInt(form.rfpId, 10),
        vendorId: parseInt(form.vendorId, 10),
        rawEmail: form.rawEmail
      };
      
      if (isNaN(proposalData.rfpId) || isNaN(proposalData.vendorId)) {
        setMsg("Error: Invalid RFP or Vendor selection");
        setLoading(false);
        return;
      }
      
      await submitProposal(proposalData);
      setMsg("Proposal submitted successfully!");
      const submittedRfpId = proposalData.rfpId;
      setForm({ rfpId: "", vendorId: "", rawEmail: "" });
      // Auto-select the RFP for comparison if one was just submitted
      if (submittedRfpId) {
        setSelectedRfpForComparison(submittedRfpId);
        // Trigger refresh after a short delay to ensure proposal is saved
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 1000);
      }
    } catch (error) {
      setMsg("Error submitting proposal: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Proposals Management</h1>
      
      {/* Submit Proposal Form */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Submit New Proposal</h2>
          <p className="text-muted">Submit a vendor proposal by pasting their email response.</p>
        </div>

        {msg && (
          <div className={msg.includes("success") ? "alert alert-success" : "alert alert-error"}>
            {msg}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">RFP:</label>
            <select
              className="form-select"
              value={form.rfpId}
              onChange={(e) => setForm({ ...form, rfpId: e.target.value })}
              required
            >
              <option value="">Select an RFP</option>
              {rfps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title || `RFP #${r.id}`} - {r.category || "General"}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Vendor:</label>
            <select
              className="form-select"
              value={form.vendorId}
              onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
              required
            >
              <option value="">Select a vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Proposal Content (Paste vendor email response):</label>
            <textarea
              className="form-textarea"
              rows={10}
              placeholder="Paste vendor email response here. The AI will automatically extract key information like price, timeline, warranty, etc."
              value={form.rawEmail}
              onChange={(e) => setForm({ ...form, rawEmail: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "📝 Submit Proposal"}
          </button>
        </form>
      </div>

      {/* Compare Proposals Section */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <div className="card-header">
          <h2 className="card-title">Compare Proposals</h2>
          <p className="text-muted">Select an RFP to view and compare all received proposals.</p>
        </div>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label className="form-label">Select RFP to Compare:</label>
          <select
            className="form-select"
            value={selectedRfpForComparison || ""}
            onChange={(e) => setSelectedRfpForComparison(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Choose an RFP...</option>
            {rfps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title || `RFP #${r.id}`} - {r.category || "General"}
              </option>
            ))}
          </select>
        </div>

        {selectedRfpForComparison && (
          <CompareProposals rfpId={selectedRfpForComparison} refreshTrigger={refreshTrigger} />
        )}
      </div>
    </div>
  );
}