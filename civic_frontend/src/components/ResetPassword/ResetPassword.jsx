import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase'
import { Link } from 'react-router-dom'
import './ResetPassword.css'

const ResetPassword = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address.')
      setMessage('')
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('Password reset email sent! Please check your inbox.')
      setError('')
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with that email address.')
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.')
      } else {
        setError(err.message)
      }
      setMessage('')
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handlePasswordReset}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
          />
          <button type="submit">Send Reset Email</button>
        </form>
        <div className="back-to-login">
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
