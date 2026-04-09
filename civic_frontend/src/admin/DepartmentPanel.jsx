// src/admin/DepartmentPanel.jsx
import React from "react";

export default function DepartmentPanel({ label, counts, loading, onOpen }) {
  return (
    <div className="dept-card">
      <h3>{label}</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="stats">
          <div>
            <strong>{counts.pending}</strong>
            <p>Pending</p>
          </div>
          <div>
            <strong>{counts.in_progress}</strong>
            <p>In Progress</p>
          </div>
          <div>
            <strong>{counts.solved}</strong>
            <p>Solved</p>
          </div>
        </div>
      )}

      <button onClick={onOpen}>View →</button>
    </div>
  );
}

