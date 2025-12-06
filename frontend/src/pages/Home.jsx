import React from "react";

export default function Home() {
  return (
    <div className="page-container">
      <div className="card">
        <h1>AI-Powered RFP Management System</h1>
        <p>Welcome to your comprehensive RFP management solution. Use the navigation above to manage RFPs, vendors, proposals, and email communications.</p>
        
        <div className="grid grid-2" style={{ marginTop: "2rem" }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <h3>📋 RFPs</h3>
            <p className="text-muted">Create and manage Request for Proposals using AI-powered assistance.</p>
          </div>
          
          <div className="card" style={{ marginBottom: 0 }}>
            <h3>🏢 Vendors</h3>
            <p className="text-muted">Manage your vendor database and contact information.</p>
          </div>
          
          <div className="card" style={{ marginBottom: 0 }}>
            <h3>📝 Proposals</h3>
            <p className="text-muted">Submit and track vendor proposals for your RFPs.</p>
          </div>
          
          <div className="card" style={{ marginBottom: 0 }}>
            <h3>📧 Email</h3>
            <p className="text-muted">Send RFPs to vendors and receive proposal responses.</p>
          </div>
        </div>
      </div>
    </div>
  );
}