// src/admin/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",// frontend proxy to Django (vite proxy) -> adjust if needed
  withCredentials: false, // set to true if you use session auth and CSRF
});

// --- API helpers ---
// Get counts per department (expected shape below)
export const getDepartmentCounts = async () => {
  return api.get("/api/complaints/counts/");
};

// List complaints for a department (dept_slug such as "streetlight" or "potholes")
export const listComplaintsByDepartment = async (deptSlug) => {
  return api.get(`/api/complaints/department/${deptSlug}/`);
};

// Update complaint status (id, newStatus: "Pending"|"In Progress"|"Solved")
export const updateComplaintStatus = (complaintId, status) => {
  return axios.post(
    `http://127.0.0.1:8000/api/complaints/${complaintId}/update-status/`,
    JSON.stringify({ status }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

// Fallback: fetch all complaints
export const listAllComplaints = async () => {
  const res = await axios.get(
    "http://127.0.0.1:8000/api/complaints/all/"
  );
  return res;   // IMPORTANT: return full response
};

export const getComplaintsByDepartment = (dept) => {
  return axios.get(`http://127.0.0.1:8000/api/complaints/department/${dept}/`);
};


export default api;
