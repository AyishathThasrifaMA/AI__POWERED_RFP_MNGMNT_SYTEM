import React, { useEffect, useState } from "react";
import { listRFPs, deleteRFP } from "../api/rfpApi";

export default function RfpList({ onSelect }) {
  const [list, setList] = useState([]);
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const data = await listRFPs();
      setList(data || []);
    } catch (error) {
      console.error("Error loading RFPs:", error);
      setList([]);
    }
  };

  const handleDelete = async (e, rfpId) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this RFP? This will also delete all associated proposals.")) {
      return;
    }

    setDeleting({ ...deleting, [rfpId]: true });
    try {
      console.log('Deleting RFP with ID:', rfpId);
      await deleteRFP(rfpId);
      await load(); 
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert("Error deleting RFP: " + errorMessage);
    } finally {
      setDeleting({ ...deleting, [rfpId]: false });
    }
  };

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">RFP List</h2>
        <p className="text-muted">Click on an RFP to view details</p>
      </div>
      
      {list.length === 0 ? (
        <div className="text-center" style={{ padding: "3rem 0" }}>
          <p className="text-muted">No RFPs found. Create one above!</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {list.map((r) => (
            <div
              key={r.id}
              className="list-item"
              onClick={() => onSelect(r)}
              style={{ position: "relative" }}
            >
              <button
                onClick={(e) => handleDelete(e, r.id)}
                disabled={deleting[r.id]}
                className="btn btn-secondary"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  zIndex: 10
                }}
                title="Delete RFP"
              >
                {deleting[r.id] ? "..." : "🗑️"}
              </button>
              <div className="list-item-header">
                <h3 className="list-item-title">{r.title || `RFP #${r.id}`}</h3>
                <span className={`badge badge-${r.status === 'created' ? 'primary' : 'success'}`}>
                  {r.status || 'created'}
                </span>
              </div>
              <div className="list-item-meta">
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Category:</strong> {r.category || r.title || 'General'}
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Budget:</strong> {r.budget || 'Not specified'}
                </div>
                <div className="text-muted" style={{ fontSize: "0.875rem" }}>
                  ID: {r.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}