import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState("");

  useEffect(() => {
    const dept = localStorage.getItem("admin_department");
    setDepartment(dept);
    fetchComplaints(dept);
  }, []);

  const fetchComplaints = async (dept) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/complaints/department/${dept}/`
      );

      setComplaints(response.data.complaints);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/complaints/update/${id}/`, {
        status: newStatus,
      });

      // refresh table
      fetchComplaints(department);
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  if (loading) return <h2>Loading complaints...</h2>;

  return (
    <div className="admin-dashboard">
      <h1>{department.toUpperCase()} Complaints</h1>

      {complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        <table className="complaints-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>

                <td>
                  <img
                    src={`http://127.0.0.1:8000${c.image}`}
                    alt="complaint"
                    className="complaint-img"
                  />
                </td>

                <td>{c.title}</td>
                <td>{c.description}</td>

                <td>
                  <span className={`status-badge ${c.status.replace(" ", "_")}`}>
                    {c.status}
                  </span>
                </td>

                <td>
                  <a
                    href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Map
                  </a>
                </td>

                <td>
                  <button onClick={() => updateStatus(c.id, "Pending")}>
                    Pending
                  </button>

                  <button onClick={() => updateStatus(c.id, "In Progress")}>
                    In Progress
                  </button>

                  <button onClick={() => updateStatus(c.id, "Solved")}>
                    Solved
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
