import React, { useState } from "react";
import SendEmail from "../components/SendEmail";
import ReceiveEmails from "../components/ReceiveEmails";

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState("send");

  return (
    <div className="page-container">
      <h1>Email Management</h1>

      {/* Tab Navigation */}
      <div className="card">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "send" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("send")}
          >
            📧 Send Email
          </button>
          <button
            className={`tab ${activeTab === "receive" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("receive")}
          >
            📥 Receive Emails
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ marginTop: "2rem" }}>
          {activeTab === "send" ? <SendEmail /> : <ReceiveEmails />}
        </div>
      </div>
    </div>
  );
}

