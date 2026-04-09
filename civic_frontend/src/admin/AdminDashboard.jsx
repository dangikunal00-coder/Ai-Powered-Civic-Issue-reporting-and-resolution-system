// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getDepartmentCounts, listComplaintsByDepartment, updateComplaintStatus, listAllComplaints } from "./api";
import DepartmentPanel from "./DepartmentPanel";
import ComplaintTable from "./ComplaintTable";
import "./admin.css";
import ComplaintHeatmap from "./ComplaintHeatmap";


const DEPARTMENTS = [
  { key: "streetlight", label: "Streetlight" },
  { key: "potholes", label: "Potholes" },
  { key: "trash_bins", label: "Garbage (Trash Bins)" },
  { key: "water_leakage", label: "Water Leakage" },
  { key: "higher_department", label: "Higher Department (All)" },
];


export default function AdminDashboard() {
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // fetch counts
  const fetchCounts = async () => {
    setLoadingCounts(true);
    try {
      const res = await getDepartmentCounts();
      setCounts(res.data || {});
    } catch (e) {
      console.error("Failed to load counts:", e);
      // fallback: counts empty
      setCounts({});
    } finally {
      setLoadingCounts(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

const openDepartment = async (deptKey) => {
  setSelectedDept(deptKey);
  setLoadingComplaints(true);

  try {
    let res;

    if (deptKey === "higher_department") {
      res = await listAllComplaints();
      setComplaints(res.data.complaints || []);
}
    else {
      res = await listComplaintsByDepartment(deptKey);
      setComplaints(res.data.complaints || []);
    }

    setModalOpen(true);
  } catch (e) {
    console.error("Failed to load complaints:", e);
    setComplaints([]);
    setModalOpen(true);
  } finally {
    setLoadingComplaints(false);
  }
};

  
  const onStatusChange = async (complaintId, newStatus) => {
  try {
    await updateComplaintStatus(complaintId, newStatus);

    let updated;

    if (newStatus === "Solved" && selectedDept !== "higher_department") {
      // ❌ remove from department table
      updated = complaints.filter(c => c.id !== complaintId);
    } else {
      // ✅ update status normally
      updated = complaints.map(c =>
        c.id === complaintId ? { ...c, status: newStatus } : c
      );
    }

    setComplaints(updated);
    fetchCounts();

  } catch (e) {
    console.error("Failed to update status:", e);
    alert("Could not update status.");
  }
};


  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <p className="muted">Departments & quick stats</p>

      <div className="dept-grid">
        {DEPARTMENTS.map((d) => (
          <DepartmentPanel
            key={d.key}
            deptKey={d.key}
            label={d.label}
            counts={counts[d.key] || { pending: 0, in_progress: 0, solved: 0 }}
            loading={loadingCounts}
            onOpen={() => openDepartment(d.key)}
          />
        ))}
      </div>
      {/* ✅ HEATMAP SECTION */}
    <h2 style={{ marginTop: "30px" }}>Complaint Heatmap</h2>
    <ComplaintHeatmap />


      {modalOpen && (
        <ComplaintTable
          deptKey={selectedDept}
          complaints={complaints}
          loading={loadingComplaints}
          onClose={() => setModalOpen(false)}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
}
