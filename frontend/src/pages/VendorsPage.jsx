import React from "react";
import VendorList from "../components/VendorList";

export default function VendorsPage() {
  return (
    <div className="page-container">
      <h1>Vendors</h1>
      <div className="card">
        <VendorList />
      </div>
    </div>
  );
}