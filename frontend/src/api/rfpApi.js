import axios from "axios";

const API = "http://localhost:5000/api/rfps";

export const createRFP = async (text) =>
  (await axios.post(`${API}`, { description: text })).data;

export const listRFPs = async () =>
  (await axios.get(`${API}`)).data;

export const getRFP = async (id) =>
  (await axios.get(`${API}/${id}`)).data;

export const evaluateRFP = async (id) =>
  (await axios.get(`${API}/${id}/evaluate`)).data;

export const deleteRFP = async (id) =>
  (await axios.delete(`${API}/${id}`)).data;

