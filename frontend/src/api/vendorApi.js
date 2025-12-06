import axios from "axios";

const API = "http://localhost:5000/api/vendors";

export const listVendors = async () =>
  (await axios.get(API)).data;

export const addVendor = async (data) =>
  (await axios.post(API, data)).data;

export const deleteVendor = async (id) =>
  (await axios.delete(`${API}/${id}`)).data;