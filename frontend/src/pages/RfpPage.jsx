import React, { useState } from "react";
import RfpCreate from "../components/RfpCreate";
import RfpList from "../components/RfpList";

export default function RfpPage() {
  const [selectedRfp, setSelectedRfp] = useState(null);

  return (
    <div className="page-container">
      <h1>RFP Management</h1>

      {/* Create New RFP */}
      <div className="card">
        <RfpCreate onCreated={() => window.location.reload()} />
      </div>

      {/* List All RFPs */}
      <div className="card">
        <RfpList onSelect={setSelectedRfp} />
      </div>

      {/* Selected RFP Details */}
      {selectedRfp && (
        <>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">RFP Details: {selectedRfp.title || `RFP #${selectedRfp.id}`}</h2>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedRfp(null)}
                style={{ marginLeft: "auto" }}
              >
                Close
              </button>
            </div>
            
            <div style={{ marginTop: "1rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Description:</strong>
                <p style={{ margin: "0.5rem 0", whiteSpace: "pre-wrap" }}>
                  {selectedRfp.description || "No description"}
                </p>
              </div>

              {selectedRfp.structuredData && (
                <div style={{
                  padding: "1rem",
                  background: "var(--bg-tertiary)",
                  borderRadius: 8,
                  marginTop: "1rem"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>📋 Structured RFP Data (AI Generated)</h3>
                  
                  {selectedRfp.structuredData.title && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong>Title:</strong> {selectedRfp.structuredData.title}
                    </div>
                  )}
                  
                  {selectedRfp.structuredData.summary && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong>Summary:</strong> {selectedRfp.structuredData.summary}
                    </div>
                  )}
                  
                  {selectedRfp.structuredData.budget && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong>💰 Budget:</strong> {selectedRfp.structuredData.budget}
                    </div>
                  )}
                  
                  {selectedRfp.structuredData.timeline && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong>⏱️ Timeline:</strong> {selectedRfp.structuredData.timeline}
                    </div>
                  )}
                  
                  {selectedRfp.structuredData.requirements && Array.isArray(selectedRfp.structuredData.requirements) && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <strong>📝 Requirements:</strong>
                      <ul style={{ margin: "0.5rem 0 0 1.5rem" }}>
                        {selectedRfp.structuredData.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <details style={{ marginTop: "1rem" }}>
                    <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                      View Raw JSON
                    </summary>
                    <pre style={{ 
                      marginTop: "0.5rem", 
                      padding: "1rem", 
                      background: "white", 
                      borderRadius: 4,
                      overflow: "auto",
                      maxHeight: "300px"
                    }}>
                      {JSON.stringify(selectedRfp.structuredData, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}