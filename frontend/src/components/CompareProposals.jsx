import React, { useEffect, useState } from "react";
import { listProposals, deleteProposal } from "../api/proposalApi";
import { evaluateRFP } from "../api/rfpApi";

export default function CompareProposals({ rfpId, refreshTrigger }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    if (rfpId) {
      setLoading(true);
      load().finally(() => setLoading(false));
    } else {
      setProposals([]);
      setEvaluation(null);
      setError(null);
    }
  }, [rfpId, refreshTrigger]);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      if (!rfpId) {
        setProposals([]);
        setLoading(false);
        return;
      }
      const rfpIdNum = typeof rfpId === 'string' ? parseInt(rfpId, 10) : rfpId;
      if (isNaN(rfpIdNum)) {
        setError("Invalid RFP ID");
        setProposals([]);
        setLoading(false);
        return;
      }
      const data = await listProposals(rfpIdNum);
      
      const seenVendors = new Set();
      const uniqueProposals = (data || []).filter((proposal, index) => {
        const vendorKey = proposal.vendorId 
          ? `vendor-${proposal.vendorId}` 
          : `vendor-name-${(proposal.vendorName || 'unknown').toLowerCase().trim()}-${index}`;
        
        if (seenVendors.has(vendorKey)) {
          return false; 
        }
        seenVendors.add(vendorKey);
        return true;
      });
      
      setProposals(uniqueProposals);
    } catch (err) {
      console.error("Error loading proposals:", err);
      setError(err?.response?.data?.error || "Failed to load proposals. Make sure the RFP exists and has proposals.");
      setProposals([]);
    } finally {
      setLoading(false);
    }
  };

  const evaluate = async () => {
    if (!rfpId || proposals.length === 0) return;
    setEvaluating(true);
    setEvaluation(null);
    setError(null);

    try {
      
      const rfpIdNum = typeof rfpId === 'string' ? parseInt(rfpId, 10) : rfpId;
      if (isNaN(rfpIdNum)) {
        setError("Invalid RFP ID");
        return;
      }
      const body = await evaluateRFP(rfpIdNum);
      setEvaluation(body.evaluation ?? body);
      
      await load();
    } catch (err) {
      console.error("Evaluation error:", err);
      setError(err?.response?.data?.error || err?.message || "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  
  const getProposalScore = (vendorName) => {
    if (!evaluation?.scores) return null;
    const scoreData = evaluation.scores.find(s => 
      s.vendorName === vendorName || 
      s.vendorName?.toLowerCase() === vendorName?.toLowerCase()
    );
    return scoreData?.score || null;
  };

  
  const isBestProposal = (vendorName) => {
    if (!evaluation?.bestProposal) return false;
    return evaluation.bestProposal === vendorName || 
           evaluation.bestProposal?.toLowerCase() === vendorName?.toLowerCase();
  };

  const handleDeleteProposal = async (e, proposalId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this proposal?")) {
      return;
    }

    setDeleting({ ...deleting, [proposalId]: true });
    try {
      await deleteProposal(proposalId);
      await load(); 
      setEvaluation(null); 
    } catch (error) {
      alert("Error deleting proposal: " + (error.response?.data?.error || error.message));
    } finally {
      setDeleting({ ...deleting, [proposalId]: false });
    }
  };

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Compare Proposals</h2>
        <p className="text-muted">Review and compare vendor proposals for this RFP.</p>
      </div>

      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={evaluate}
          disabled={!rfpId || evaluating || loading || proposals.length === 0}
          className="btn btn-primary"
        >
          {evaluating ? "🤖 Evaluating..." : "🤖 Run AI Evaluation"}
        </button>
        <button
          onClick={() => {
            if (!loading && !evaluating) {
              load();
            }
          }}
          disabled={loading || evaluating}
          className="btn btn-secondary"
        >
          {loading ? "🔄 Refreshing..." : "🔄 Refresh Proposals"}
        </button>
        {proposals.length > 0 && (
          <span style={{ alignSelf: "center", color: "var(--text-muted)" }}>
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center" style={{ padding: "2rem" }}>
          <p className="text-muted">Loading proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center" style={{ padding: "2rem" }}>
          <p className="text-muted">No proposals found for this RFP yet.</p>
          <p className="text-muted" style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Submit proposals through the Proposals page to compare them here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-2" style={{ gap: 16, marginBottom: evaluation ? 24 : 0 }}>
            {proposals.map((p, index) => {
              const score = p.aiScore || getProposalScore(p.vendorName);
              const isBest = isBestProposal(p.vendorName);
              
              const uniqueKey = p.id ? `proposal-${p.id}-${index}` : `proposal-${index}`;
              
              return (
                <div 
                  key={uniqueKey} 
                  className="list-item" 
                  style={{ 
                    padding: 16, 
                    border: isBest ? "2px solid #4CAF50" : "1px solid #eee", 
                    borderRadius: 8,
                    background: isBest ? "rgba(76, 175, 80, 0.05)" : "white",
                    position: "relative"
                  }}
                >
                  {isBest && (
                    <div style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "#4CAF50",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      zIndex: 5
                    }}>
                      ⭐ RECOMMENDED
                    </div>
                  )}
                  <button
                    onClick={(e) => handleDeleteProposal(e, p.id)}
                    disabled={deleting[p.id]}
                    className="btn btn-secondary"
                    style={{
                      position: "absolute",
                      top: isBest ? 40 : 8,
                      right: 8,
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      zIndex: 10
                    }}
                    title="Delete Proposal"
                  >
                    {deleting[p.id] ? "..." : "🗑️"}
                  </button>
                  
                  <div className="list-item-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 className="list-item-title" style={{ margin: 0, fontSize: "1.25rem" }}>
                      {p.vendorName || p.vendorId || "Unknown Vendor"}
                    </h3>
                    {score !== null && (
                      <span 
                        className="badge badge-primary"
                        style={{ 
                          fontSize: "1rem",
                          padding: "6px 12px",
                          background: score >= 80 ? "#4CAF50" : score >= 60 ? "#FF9800" : "#F44336"
                        }}
                      >
                        Score: {score}/100
                      </span>
                    )}
                  </div>
                  
                  <div className="list-item-meta" style={{ marginTop: 8 }}>
                    <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8 }}>
                      <strong>💰 Price:</strong> 
                      <span>{p.price ?? p.content?.cost ?? p.content?.price ?? "Not specified"}</span>
                    </div>
                    <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8 }}>
                      <strong>📦 Delivery:</strong> 
                      <span>
                        {p.deliveryDays ?? p.content?.timeline ?? p.content?.deliveryDays 
                          ? `${p.deliveryDays ?? p.content?.timeline ?? p.content?.deliveryDays} days` 
                          : "Not specified"}
                      </span>
                    </div>
                    <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: 8 }}>
                      <strong>🛡️ Warranty:</strong> 
                      <span>{p.warranty ?? p.content?.warranty ?? "Not specified"}</span>
                    </div>
                    
                    {p.aiSummary && (
                      <div style={{
                        marginTop: "1rem",
                        padding: "0.75rem",
                        background: "var(--bg-tertiary, #f7f7f7)",
                        borderRadius: 6,
                        fontSize: "0.9rem"
                      }}>
                        <strong>Summary:</strong>
                        <p style={{ margin: "0.5rem 0 0 0" }}>{p.aiSummary}</p>
                      </div>
                    )}
                    
                    {p.strengths && p.strengths.length > 0 && (
                      <div style={{ marginTop: "1rem" }}>
                        <strong style={{ color: "#4CAF50" }}>✅ Strengths:</strong>
                        <ul style={{ margin: "0.5rem 0 0 1.5rem", fontSize: "0.9rem" }}>
                          {p.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {p.weaknesses && p.weaknesses.length > 0 && (
                      <div style={{ marginTop: "1rem" }}>
                        <strong style={{ color: "#F44336" }}>⚠️ Weaknesses:</strong>
                        <ul style={{ margin: "0.5rem 0 0 1.5rem", fontSize: "0.9rem" }}>
                          {p.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {evaluation && (
            <div style={{ marginTop: 24 }} className="card">
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>🤖 AI Evaluation Results</h3>
              
              {evaluation.summary && (
                <div style={{ 
                  padding: "1rem", 
                  background: "var(--bg-tertiary)", 
                  borderRadius: 8, 
                  marginBottom: 16 
                }}>
                  <strong>Summary:</strong>
                  <p style={{ margin: "0.5rem 0 0 0", lineHeight: 1.6 }}>{evaluation.summary}</p>
                </div>
              )}
              
              {evaluation.bestProposal && (
                <div style={{ 
                  padding: "1rem", 
                  background: "rgba(76, 175, 80, 0.1)", 
                  borderRadius: 8, 
                  marginBottom: 16,
                  border: "1px solid #4CAF50"
                }}>
                  <strong style={{ color: "#4CAF50" }}>🏆 Best Proposal:</strong>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.1rem", fontWeight: "bold" }}>
                    {evaluation.bestProposal}
                  </p>
                </div>
              )}
              
              {evaluation.comparison && (
                <div style={{ marginBottom: 16 }}>
                  <strong>Quick Comparison:</strong>
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {evaluation.comparison.priceLeader && (
                      <span className="badge badge-secondary">
                        💰 Best Price: {evaluation.comparison.priceLeader}
                      </span>
                    )}
                    {evaluation.comparison.qualityLeader && (
                      <span className="badge badge-secondary">
                        ⭐ Best Quality: {evaluation.comparison.qualityLeader}
                      </span>
                    )}
                    {evaluation.comparison.fastestDelivery && (
                      <span className="badge badge-secondary">
                        ⚡ Fastest: {evaluation.comparison.fastestDelivery}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {evaluation.scores && evaluation.scores.length > 0 && (
                <div>
                  <strong>Detailed Scores:</strong>
                  <div style={{ marginTop: "0.5rem" }}>
                    {evaluation.scores.map((score, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          padding: "0.75rem", 
                          marginTop: "0.5rem",
                          background: "var(--bg-tertiary)", 
                          borderRadius: 6 
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong>{score.vendorName}</strong>
                          <span className="badge badge-primary">Score: {score.score}/100</span>
                        </div>
                        {score.recommendation && (
                          <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.9rem" }}>
                            {score.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {evaluation.error && (
                <div className="alert alert-error" style={{ marginTop: 16 }}>
                  <strong>Evaluation Error:</strong> {evaluation.error}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
