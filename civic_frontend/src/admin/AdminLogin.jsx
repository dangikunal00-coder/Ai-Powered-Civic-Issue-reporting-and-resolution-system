import React, { useState } from "react";
import axios from "axios";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [department, setDepartment] = useState("streetlight");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/complaints/admin/login/",
        {
          username,
          password,
          department,
        }
      );

      // Save token
      localStorage.setItem("admin_token", response.data.token);
      localStorage.setItem("admin_department", department);

      window.location.href = "/admin-dashboard";
    } catch (err) {
      setError("Invalid login credentials");
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-box" onSubmit={handleLogin}>
        <h2>Admin Login</h2>

        <label>Department</label>
     <select value={department} onChange={(e) => setDepartment(e.target.value)}>
  <option value="streetlight">Streetlight Department</option>
  <option value="potholes">Potholes Department</option>
  <option value="trash_bins">Garbage Department</option>
  <option value="water_leakage">Water Leakage Department</option>
  <option value="garbage">Garbage (Old Admin)</option>
  <option value="all">Higher Department (All)</option>
</select>



        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
