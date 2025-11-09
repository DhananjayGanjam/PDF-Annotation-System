import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Set current user role (A1, D1, D2, R1)
export const setUser = (role: string) => {
  api.defaults.headers.common["x-user"] = role;
};

// Upload PDFs
export const uploadPDFs = async (files: File[]) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return api.post("/documents", form);
};

// Get uploaded documents list
export const getDocuments = async () => {
  const res = await api.get("/documents");
  return res.data;
};

export default api;
