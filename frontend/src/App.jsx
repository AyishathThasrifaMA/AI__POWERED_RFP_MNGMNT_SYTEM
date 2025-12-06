import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import RfpPage from "./pages/RfpPage";
import VendorsPage from "./pages/VendorsPage";
import ProposalsPage from "./pages/ProposalsPage";
import EmailPage from "./pages/EmailPage";

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">🏠 Home</Link>
        <Link to="/rfp">📋 RFPs</Link>
        <Link to="/vendors">🏢 Vendors</Link>
        <Link to="/proposals">📝 Proposals</Link>
        <Link to="/email">📧 Email</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rfp" element={<RfpPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/proposals" element={<ProposalsPage />} />
        <Route path="/email" element={<EmailPage />} />
      </Routes>
    </BrowserRouter>
  );
}