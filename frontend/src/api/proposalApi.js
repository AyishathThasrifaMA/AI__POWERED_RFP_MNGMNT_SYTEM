import axios from "axios";

const API = "http://localhost:5000/api/proposals";

export const submitProposal = async (data) =>
  (await axios.post(API, data)).data;

export const listProposals = async (rfpId) => {
  if (!rfpId) {
    throw new Error("RFP ID is required");
  }
  return (await axios.get(`${API}/rfp/${rfpId}`)).data;
};

export const listProposalsByVendor = async (vendorId) => {
  if (!vendorId) {
    throw new Error("Vendor ID is required");
  }
  return (await axios.get(`${API}/vendor/${vendorId}`)).data;
};

export const deleteProposal = async (id) =>
  (await axios.delete(`${API}/${id}`)).data;