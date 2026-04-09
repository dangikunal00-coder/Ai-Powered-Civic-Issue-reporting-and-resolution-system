import React from 'react'
import './ComplaintSection.css'

const ComplaintSection = ({ title, buttonText, isActionable, action }) => {
  return (
    <div className="complaint-section" onClick={isActionable ? action : null}>
      <div className="section-content">
        <p>{title}</p>
        {buttonText && (
          <button className="section-button" onClick={action}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}

export default ComplaintSection
