import React, { useState, useEffect } from 'react'
import {
  updateProfile,
  updateEmail,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import './Profile.css'

const Profile = () => {
  const [user, setUser] = useState(auth.currentUser)
  const [name, setName] = useState(user?.displayName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [editingEmail, setEditingEmail] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setName(currentUser.displayName || '')
        setEmail(currentUser.email || '')
      } else {
        navigate('/login')
      }
    })
    return () => unsubscribe()
  }, [navigate])

  const handleUpdateName = async (e) => {
    e.preventDefault()
    if (name === user.displayName) {
      setMessage('Name is already up to date.')
      setEditingName(false)
      return
    }
    try {
      await updateProfile(user, { displayName: name })
      setMessage('Name updated successfully!')
      setError('')
      setEditingName(false)
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  const handleUpdateEmail = async (e) => {
    e.preventDefault()
    if (email === user.email) {
      setMessage('Email is already up to date.')
      setEditingEmail(false)
      return
    }
    try {
      await updateEmail(user, email)
      setMessage(
        'Email updated successfully! Please re-login with your new email.'
      )
      setError('')
      setEditingEmail(false)
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email)
      setMessage('Password reset email sent! Check your inbox.')
      setError('')
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  const goBack = () => {
    navigate(-1)
  }

  if (!user) {
    return <div className="loading-spinner">Loading...</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <span className="back-arrow" onClick={goBack}>
            &larr;
          </span>
          <h2>Profile Settings</h2>
        </div>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        {/* Username Section */}
        <div className="profile-row">
          <div className="profile-icon">👤</div>
          <div className="profile-info">
            <span className="info-label">Username</span>
            {editingName ? (
              <form onSubmit={handleUpdateName}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <button type="submit" className="save-button">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span className="info-value">{user?.displayName || 'N/A'}</span>
            )}
          </div>
          {!editingName && (
            <button
              className="edit-button"
              onClick={() => setEditingName(true)}
            >
              Edit
            </button>
          )}
        </div>

        {/* Email Section */}
        <div className="profile-row">
          <div className="profile-icon">✉️</div>
          <div className="profile-info">
            <span className="info-label">Email</span>
            {editingEmail ? (
              <form onSubmit={handleUpdateEmail}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="save-button">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setEditingEmail(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <span className="info-value">{user?.email || 'N/A'}</span>
            )}
          </div>
          {!editingEmail && (
            <button
              className="edit-button"
              onClick={() => setEditingEmail(true)}
            >
              Edit
            </button>
          )}
        </div>

        {/* Password Section */}
        <div className="profile-row">
          <div className="profile-icon">🔒</div>
          <div className="profile-info">
            <span className="info-label">Password</span>
            <span className="info-value">••••••••</span>
          </div>
          <button className="edit-button" onClick={handlePasswordReset}>
            Edit
          </button>
        </div>

        {/* Single "Edit Profile" button from image 1 */}
        <button
          className="edit-profile-btn"
          onClick={() => {
            setEditingName(true)
            setEditingEmail(true)
          }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  )
}

export default Profile
