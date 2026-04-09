import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firebase'
import './ProfileSettings.css'

const ProfileSettings = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(auth.currentUser)

  useEffect(() => {
    // This listener ensures the UI updates if the user's data changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      }
    })
    return () => unsubscribe()
  }, [])

  // Placeholder functions for edit actions
  const handleEditName = () => {
    alert("Redirect to 'Update Name' form")
  }

  const handleEditEmail = () => {
    alert("Redirect to 'Update Email' form")
  }

  const handleEditPassword = () => {
    alert("Redirect to 'Change Password' process")
  }

  const goBack = () => {
    navigate(-1) // Navigates to the previous page in history
  }

  return (
    <div className="profile-settings-container">
      <div className="profile-settings-header">
        <span className="back-arrow" onClick={goBack}>
          &larr;
        </span>
        <h2>Profile Settings</h2>
      </div>
      <div className="profile-settings-content">
        {/* Username Section */}
        <div className="profile-row">
          <div className="profile-icon">👤</div>
          <div className="profile-info">
            <span className="info-label">Username</span>
            <span className="info-value">{user?.displayName || 'N/A'}</span>
          </div>
          <button className="edit-button" onClick={handleEditName}>
            Edit
          </button>
        </div>
        {/* Email Section */}
        <div className="profile-row">
          <div className="profile-icon">✉️</div>
          <div className="profile-info">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email || 'N/A'}</span>
          </div>
          <button className="edit-button" onClick={handleEditEmail}>
            Edit
          </button>
        </div>
        {/* Password Section */}
        <div className="profile-row">
          <div className="profile-icon">🔒</div>
          <div className="profile-info">
            <span className="info-label">Password</span>
            <span className="info-value">••••••••</span>
          </div>
          <button className="edit-button" onClick={handleEditPassword}>
            Edit
          </button>
        </div>
      </div>
      {/* The single "Edit Profile" button from your first image */}
      <button className="edit-profile-btn">Edit Profile</button>
    </div>
  )
}

export default ProfileSettings
