import React, { useEffect, useState } from "react";
import { listVendors, addVendor, deleteVendor } from "../api/vendorApi";
import { listProposalsByVendor } from "../api/proposalApi";

export default function VendorList() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [vendorProposals, setVendorProposals] = useState({});
  const [loadingProposals, setLoadingProposals] = useState({});
  const [deleting, setDeleting] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setVendors(await listVendors());
    } catch (error) {
      console.error("Error loading vendors:", error);
    }
  };

  const loadProposals = async (vendorId) => {
    if (vendorProposals[vendorId]) {
      setExpandedVendor(expandedVendor === vendorId ? null : vendorId);
      return;
    }

    setLoadingProposals({ ...loadingProposals, [vendorId]: true });
    try {
      const proposals = await listProposalsByVendor(vendorId);
      setVendorProposals({ ...vendorProposals, [vendorId]: proposals || [] });
      setExpandedVendor(vendorId);
    } catch (error) {
      console.error("Error loading proposals:", error);
      setVendorProposals({ ...vendorProposals, [vendorId]: [] });
    } finally {
      setLoadingProposals({ ...loadingProposals, [vendorId]: false });
    }
  };

  const handleDelete = async (e, vendorId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this vendor? This will also delete all associated proposals.")) {
      return;
    }

    setDeleting({ ...deleting, [vendorId]: true });
    try {
      await deleteVendor(vendorId);
      await load(); 
      const newProposals = { ...vendorProposals };
      delete newProposals[vendorId];
      setVendorProposals(newProposals);
      if (expandedVendor === vendorId) {
        setExpandedVendor(null);
      }
    } catch (error) {
      alert("Error deleting vendor: " + (error.response?.data?.error || error.message));
    } finally {
      setDeleting({ ...deleting, [vendorId]: false });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setMessage("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await addVendor(form);
      setForm({ name: "", email: "" });
      setMessage("Vendor added successfully!");
      load();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error adding vendor: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Vendors</h2>
        <p className="text-muted">Manage your vendor database and contact information.</p>
      </div>

      {message && (
        <div className={message.includes("success") ? "alert alert-success" : "alert alert-error"}>
          {message}
        </div>
      )}

      <div className="card" style={{ background: "var(--bg-tertiary)", marginBottom: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Add New Vendor</h3>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Vendor Name:</label>
            <input
              className="form-input"
              placeholder="Enter vendor name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address:</label>
            <input
              type="email"
              className="form-input"
              placeholder="vendor@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Adding..." : "➕ Add Vendor"}
          </button>
        </form>
      </div>

      <div>
        <h3>Vendor List ({vendors.length})</h3>
        {vendors.length === 0 ? (
          <p className="text-muted">No vendors added yet. Add one above!</p>
        ) : (
          <div className="grid grid-2">
            {vendors.map((v) => (
              <div key={v.id} className="list-item" style={{ position: "relative" }}>
                <button
                  onClick={(e) => handleDelete(e, v.id)}
                  disabled={deleting[v.id]}
                  className="btn btn-secondary"
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    padding: "4px 8px",
                    fontSize: "0.75rem",
                    zIndex: 10
                  }}
                  title="Delete Vendor"
                >
                  {deleting[v.id] ? "..." : "🗑️"}
                </button>
                <div className="list-item-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="list-item-title">{v.name}</h3>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: "0.875rem", padding: "4px 8px", marginRight: "2rem" }}
                    onClick={() => loadProposals(v.id)}
                    disabled={loadingProposals[v.id]}
                  >
                    {loadingProposals[v.id] ? "Loading..." : expandedVendor === v.id ? "▼ Hide Proposals" : "▶ View Proposals"}
                  </button>
                </div>
                <div className="list-item-meta">
                  <div style={{ marginBottom: "0.5rem" }}>
                    <strong>Email:</strong> <a href={`mailto:${v.email}`}>{v.email}</a>
                  </div>
                  {v.contactPerson && (
                    <div style={{ marginBottom: "0.5rem" }}>
                      <strong>Contact:</strong> {v.contactPerson}
                    </div>
                  )}
                </div>

                {/* Proposals List */}
                {expandedVendor === v.id && (
                  <div style={{ 
                    marginTop: "1rem", 
                    padding: "1rem", 
                    background: "var(--bg-tertiary)", 
                    borderRadius: 8,
                    border: "1px solid #eee"
                  }}>
                    <h4 style={{ marginTop: 0, marginBottom: "0.75rem" }}>📝 Proposals ({vendorProposals[v.id]?.length || 0})</h4>
                    {loadingProposals[v.id] ? (
                      <p className="text-muted">Loading proposals...</p>
                    ) : !vendorProposals[v.id] || vendorProposals[v.id].length === 0 ? (
                      <p className="text-muted">No proposals submitted by this vendor yet.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {vendorProposals[v.id].map((proposal) => (
                          <div 
                            key={proposal.id} 
                            style={{ 
                              padding: "0.75rem", 
                              background: "white", 
                              borderRadius: 6,
                              border: "1px solid #ddd"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                              <div>
                                <strong>{proposal.rfpTitle}</strong>
                                {proposal.aiScore !== null && (
                                  <span className="badge badge-primary" style={{ marginLeft: "0.5rem" }}>
                                    Score: {proposal.aiScore}/100
                                  </span>
                                )}
                              </div>
                            </div>
                            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                              <div style={{ marginBottom: "0.25rem" }}>
                                <strong>💰 Price:</strong> {proposal.price}
                              </div>
                              {proposal.deliveryDays && (
                                <div style={{ marginBottom: "0.25rem" }}>
                                  <strong>📦 Delivery:</strong> {proposal.deliveryDays} days
                                </div>
                              )}
                              {proposal.aiSummary && (
                                <div style={{ marginTop: "0.5rem", fontStyle: "italic" }}>
                                  {proposal.aiSummary.substring(0, 100)}...
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}