import React, { useState, useEffect } from 'react'
import AdminDashboard from "./admin/AdminDashboard";
import AdminLogin from "./admin/AdminLogin";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Dashboard from './components/Dashboard/Dashboard'
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Profile from './components/Profile/Profile'
import './App.css'

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-spinner">
        loading...
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/profile"
            element={
              isAuthenticated ? <Profile /> : <Navigate to="/login" replace />
            }
          />

          {/* ADMIN ROUTES */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* ✅ FIXED ROUTE HERE (previously /admin) */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App
