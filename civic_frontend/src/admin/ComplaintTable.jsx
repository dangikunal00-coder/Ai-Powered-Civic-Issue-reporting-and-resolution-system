// src/admin/ComplaintTable.jsx
import React from "react";
import "./admin.css";


const STATUS_SEQUENCE = ["Pending", "In Progress", "Solved"];

export default function ComplaintTable({ deptKey, complaints = [], loading, onClose, onStatusChange }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{deptKey === "higher_department" ? "All Departments" : deptKey}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {loading ? (
          <div>Loading complaints...</div>
        ) : (
          <>
            <div className="table-container">
  <table>
             <thead>
                  <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Predicted</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Votes</th>
                  <th>Intensity</th>
                  <th>Image</th>
                  <th>Actions</th>
                  </tr>
                  </thead>
              <tbody>
                {complaints.length === 0 && (
                  <tr><td colSpan="10">No complaints</td></tr>
                )}
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className={`row-${c.status.toLowerCase().replace(" ", "-")}`}
                  >

                    <td>{c.id}</td>
                    <td>{c.title}</td>
                    <td>{c.description || "—"}</td>

                    <td>{c.predicted_class || c.predicted}</td>
                    <td>{c.latitude ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}` : "N/A"}</td>
                   <td>{c.status}</td>

                    <td>{c.votes || 0}</td>

                   <td>
  {c.votes >= 10
    ? "🔴 High"
    : c.votes >= 5
    ? "🟠 Medium"
    : "🟡 Low"}
</td>

                    <td>
{(c.image_url || c.image) ? (
  <img src={c.image_url || c.image} alt="preview" style={{ width: 80 }} />
) : "—"}
                    </td>
                    <td>
                      {STATUS_SEQUENCE.map((s) => (
                        <button
                          key={s}
                          disabled={s === c.status}
                          className="status-btn"
                          onClick={() => onStatusChange(c.id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
</div>
          </>
        )}
      </div>
    </div>
  );
}
