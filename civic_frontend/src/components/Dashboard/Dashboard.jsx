import React, { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../firebase'
import { supabase } from '../../supabaseClient'
import './Dashboard.css'
import Header from '../Header/Header'
import ComplaintSection from '../ComplaintSection/ComplaintSection'
import { useNavigate } from 'react-router-dom'
import { IoMdHome } from 'react-icons/io'
import { IoNotifications } from 'react-icons/io5'
import { IoIosAddCircle } from 'react-icons/io'
import { FaUserCircle } from 'react-icons/fa'
import { PiDotsThreeCircleDuotone } from 'react-icons/pi'
import HeroImg from '../../assets/hero-dkmynbhu.png'

import { MdOutlineSecurity } from 'react-icons/md'
import { IoCallOutline } from 'react-icons/io5'
import { FaExclamationCircle } from 'react-icons/fa'
import { FaBusAlt } from 'react-icons/fa'
import { FaTrafficLight } from 'react-icons/fa'
import { FaLocationDot } from 'react-icons/fa6'
import { FaRegQuestionCircle } from 'react-icons/fa'
import axios from "axios";


const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [capturedLocation, setCapturedLocation] = useState(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [complaintTitle, setComplaintTitle] = useState('Broken streetlight')
  const [complaintDescription, setComplaintDescription] = useState('')
  // NEW: Track whether title was filled by AI or manually
  const [predictionSource, setPredictionSource] = useState("none");
  const [duplicateComplaint, setDuplicateComplaint] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);


  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showComplaintMenu, setShowComplaintMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [currentFacingMode, setCurrentFacingMode] = useState('environment') // State to toggle cameras
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const LABEL_MAP = {
  potholes: "Potholes",
  streetlight: "Broken streetlight",
  trash_bins: "Overflowing garbage bins",
  water_leakage: "Water leakages",
  unknown: "Unknown Issue"
};
const REVERSE_LABEL_MAP = {
  "Potholes": "potholes",
  "Broken streetlight": "streetlight",
  "Overflowing garbage bins": "trash_bins",
  "Water leakages": "water_leakage",
  "Unknown Issue": "unknown"
};



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  // Effect hook to manage camera stream lifecycle
  useEffect(() => {
    let stream = null
    if (isCameraOpen) {
      const startCamera = async () => {
        try {
          const constraints = { video: { facingMode: currentFacingMode } }
          stream = await navigator.mediaDevices.getUserMedia(constraints)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (err) {
          console.error('Error accessing the camera:', err)
          alert('Could not access the camera. Please check your permissions.')
          setIsCameraOpen(false)
        }
      }
      startCamera()
    }
    return () => {
      if (stream) {
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [isCameraOpen, currentFacingMode]) // Re-run effect when facing mode changes

  const openCamera = () => {
    setCapturedImage(null)
    setIsFormVisible(false)
    setIsCameraOpen(true)
  }

  const toggleCamera = () => {
    setCurrentFacingMode(currentFacingMode === 'user' ? 'environment' : 'user')
  }

  // helper: convert dataURL -> Blob
  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }
 const fetchLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCapturedLocation(loc);
        resolve(loc);
      },
      (error) => reject(error),
      { enableHighAccuracy: true }
    );
  });
};

const captureImage = async () => {
  const location = await fetchLocation();

  if (!videoRef.current) return;

  const video = videoRef.current;
  if (video.videoWidth === 0) return;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    // ✅ FIX — SAVE IMAGE PREVIEW FOR FORM + SUBMIT
    setCapturedImage(canvas.toDataURL("image/jpeg"));

    const formData = new FormData();
    formData.append("file", blob, "capture.jpg");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/complaints/predict/",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const result = response.data;
      const predictedClass = result.predicted_class || "unknown";
      const prettyLabel = LABEL_MAP[predictedClass] || "Unknown Issue";

      setComplaintTitle(prettyLabel); 
      setPredictionSource("ai");
      setIsCameraOpen(false);
      setIsFormVisible(true);

      // 🔍 Check for duplicate complaint
try {
  setCheckingDuplicate(true);

  const dupRes = await axios.post(
  "http://127.0.0.1:8000/api/complaints/check-duplicate/",
  {
   
  title: prettyLabel,
  latitude: location.latitude,
  longitude: location.longitude,


  }
);


  if (dupRes.data?.duplicate) {
    setDuplicateComplaint(dupRes.data.complaint);
  } else {
    setDuplicateComplaint(null);
  }

} catch (err) {
  console.error("Duplicate check failed", err);
  setDuplicateComplaint(null);
} finally {
  setCheckingDuplicate(false);
}


    } catch (error) {
      console.error("Prediction error:", error);
      alert("Prediction failed!");
    }
  }, "image/jpeg");
};



  const handleBack = () => {
    setShowComplaintMenu(false)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const cancelForm = () => {
    setIsFormVisible(false)
    setCapturedImage(null)
    setCapturedLocation(null)
  }

  const handleFormSubmit = async (e) => {
    
    e.preventDefault()
    if (!capturedImage) {
      alert('Please capture an image before submitting.')
      return
    }

    if (!user) {
      alert('You must be logged in to submit a complaint.')
      return
    }

    setIsSubmitting(true)

    try {
      // convert the currently capturedImage (base64) -> Blob
      const imageFile = dataURLtoBlob(capturedImage)

      // Send image to Django prediction endpoint before upload (so you can act on prediction)
      try {
        const formData = new FormData()
        formData.append('file', imageFile, 'image.jpg')

        const response = await axios.post("http://127.0.0.1:8000/api/complaints/predict/", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});



        const result = response.data
        console.log('AI prediction:', result)

        if (result && result.title) {
          // optionally set the complaint title to the predicted class
setComplaintTitle(prettyLabel); // Correct dropdown fill

        } else {
          
        }
      } catch (err) {
        console.error('Prediction API error:', err)
        // continue the flow — we still upload and create complaint even if prediction fails
        alert('Could not get prediction from AI model.')
      }

      // Now upload image to Supabase storage
// Send complaint to Django backend
const complaintData = new FormData();
const predictionLabel = REVERSE_LABEL_MAP[complaintTitle] || "unknown";

complaintData.append("file", imageFile, "image.jpg");
complaintData.append("title", complaintTitle);
complaintData.append("description", complaintDescription);

complaintData.append("submit_anyway", "true");
complaintData.append("confidence", "0.90"); // optional
complaintData.append("latitude", capturedLocation?.latitude || "");
complaintData.append("longitude", capturedLocation?.longitude || "");
complaintData.append("user_id", user.uid);
complaintData.append("user_email", user.email);

const complaintResponse = await axios.post(
  "http://127.0.0.1:8000/api/complaints/create/",
  complaintData,
  { headers: { "Content-Type": "multipart/form-data" } }
);


console.log("Complaint saved:", complaintResponse.data);
alert("Complaint submitted successfully!");
setDuplicateComplaint(null);   // ✅ CLEAR DUPLICATE STATE


      setCapturedImage(null)
      setCapturedLocation(null)
      setComplaintTitle('Broken streetlight')
      setIsFormVisible(false)
    } catch (error) {
      console.error('Error submitting complaint:', error)
      alert('Failed to submit complaint. ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const userName = user ? user.displayName || user.email.split('@')[0] : 'Guest'
  const showFooter =
    !isCameraOpen && !isFormVisible && !showComplaintMenu && !capturedImage

  const renderMainContent = () => (
    <>
      <div className="dashboard-banner">
        <img src={HeroImg} alt="BMP" />
      </div>
      <div className="button-grid">
        <div className="grid-button">
          <MdOutlineSecurity /> <span>BMC</span>
        </div>
        <div className="grid-button">
          <IoCallOutline />
          <span>Helpline</span>
        </div>
        <div className="grid-button" onClick={() => setShowComplaintMenu(true)}>
          <FaExclamationCircle />
          <span className="button-label">Complaint</span>
        </div>
        <div className="grid-button">
          <FaBusAlt />
          <span>B Bus</span>
        </div>
        <div className="grid-button">
          <FaTrafficLight />
          <span>Traffic</span>
        </div>
        <div className="grid-button">
          <FaLocationDot />
          <span>Nearby facilities</span>
        </div>
        <div className="grid-button">
          <FaRegQuestionCircle />
          <span>FAQ</span>
        </div>
      </div>
    </>
  )

  const renderComplaintMenu = () => (
    <div className="complaint-menu">
      <div className="complaint-menu-header">
        <span className="back-arrow-new" onClick={handleBack}>
          &larr;
        </span>
        <h2>Complaint</h2>
      </div>
      <div className="menu-list">
        <div className="menu-item" onClick={openCamera}>
          <span className="item-icon">📝</span>
          <span className="item-text">Register a new complaint</span>
        </div>
        <div
          className="menu-item"
          onClick={() => alert('Viewing all complaints...')}
        >
          <span className="item-icon">📜</span>
          <span className="item-text">View all complaint</span>
        </div>
        <div
          className="menu-item"
          onClick={() => alert('Searching complaints...')}
        >
          <span className="item-icon">🔍</span>
          <span className="item-text">Search your complaint</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="dashboard-container">
      <Header />
      <main className="dashboard-content-new">
        {isCameraOpen ? (
          <div className="camera-view">
            <h3>Live Camera Feed</h3>
            <video ref={videoRef} autoPlay playsInline></video>
            <div className="camera-controls">
              <button onClick={captureImage} className="camera-button">
                Capture Image
              </button>
              <button onClick={toggleCamera} className="camera-button">
                Switch Camera
              </button>
              <button
                onClick={() => setIsCameraOpen(false)}
                className="camera-button close-button"
              >
                Close Camera
              </button>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>
        ) : capturedImage && !isFormVisible ? (
          <div className="captured-image-container">
            <h3>Captured Image</h3>
            <img src={capturedImage} alt="Captured for complaint" />
            <p className="location-info">
              Location: {capturedLocation?.latitude || 'N/A'},{' '}
              {capturedLocation?.longitude || 'N/A'}
            </p>
            <div className="form-buttons">
              <button
                type="button"
                onClick={cancelForm}
                className="camera-button cancel-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsFormVisible(true)}
                className="camera-button"
              >
                Proceed to Complaint
              </button>
            </div>
          </div>
        ) : isFormVisible ? (
          <form onSubmit={handleFormSubmit} className="complaint-form">
 <h1 className="complaint-main-heading">Complaint Details</h1>
 


  <div className="form-group">
    <label htmlFor="complaint-title">Complaint Title</label>
    <select
      id="complaint-title"
      value={complaintTitle}
      onChange={(e) => {
        setComplaintTitle(e.target.value);
        setPredictionSource("manual");   
      }}
      required
    >
      <option>Broken streetlight</option>
      <option>Potholes</option>
      <option>Overflowing garbage bins</option>
      <option>Water leakages</option>
    </select>
    {predictionSource === "ai" && (
  <p style={{ color: "green", marginTop: "6px" }}>
     Auto-filled by AI from captured image
  </p>
)}

{predictionSource === "manual" && (
  <p style={{ color: "blue", marginTop: "6px" }}>
     You edited the title manually
  </p>
)}

  </div>

  <div className="form-group">
    <label htmlFor="complaint-description">Description</label>
    <textarea
      id="complaint-description"
      value={complaintDescription}
      onChange={(e) => setComplaintDescription(e.target.value)}
      placeholder="Provide details about the issue..."
      required
    ></textarea>
  </div>
 
  <div className="form-buttons">
    <button
      type="button"
      onClick={cancelForm}
      className="camera-button cancel-button"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="camera-button"
      disabled={isSubmitting}
    >
      {isSubmitting ? "Submitting..." : "Submit Complaint"}
    </button>
  </div>
  {duplicateComplaint && (
  <div className="duplicate-card">

    <h2>⚠ Similar Complaint Found Nearby</h2>

    <div className="duplicate-content">

  <div className="duplicate-image">
    <img
  src={duplicateComplaint.image}
  alt="Previous complaint"
/>
  </div>

  <div className="duplicate-info">

    <h4>Description</h4>
    <p>{duplicateComplaint.description}</p>

    <h5> Confirmations: {duplicateComplaint.votes}</h5>

    <div className="duplicate-buttons">
<button
  type="button"
  className="confirm-btn"
  onClick={async () => {

    await axios.post(
      `http://127.0.0.1:8000/api/complaints/${duplicateComplaint.id}/vote-up/`
    );

    window.alert("Thanks for confirming the issue!");

// reset form state
setDuplicateComplaint(null);
setIsFormVisible(false);
setCapturedImage(null);
setCapturedLocation(null);
setComplaintDescription("");

// go back to main dashboard
setShowComplaintMenu(false);

  }}
>
   Confirm Issue
</button>

      <button
        className="cancel-btn"
        onClick={() => setDuplicateComplaint(null)}
      >
        Cancel
      </button>
      


    </div>

  </div>

</div>

  </div>
)}
</form>


        ) : showComplaintMenu ? (
          renderComplaintMenu()
        ) : (
          renderMainContent()
        )}
        
      </main>
      {showFooter && (
        <div className="app-footer">
          <div className="footer-item">
            <i className="fas fa-home"></i>
            <span className="userIcon">
              <IoMdHome />
            </span>
          </div>
          <div className="footer-item">
            <i className="fas fa-bell"></i>
            <span className="userIcon">
              <IoNotifications />
            </span>
          </div>
          <div className="footer-add-btn" onClick={openCamera}>
            {/* <i className="fas fa-plus"></i> */}
            <span className="userIcon">
              <IoIosAddCircle />
            </span>
          </div>
          <div
            className="footer-item profile-dropdown-container"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {/* <i className="fas fa-user-circle"></i> */}
            <span className="userIcon">
              <FaUserCircle />
            </span>
            {/* <span>{user?.displayName || 'Profile'}</span> */}
            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => navigate('/profile')}
                >
                  View Profile
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  Logout
                </div>
              </div>
            )}
          </div>
          <div className="footer-item">
            <i className="fas fa-bars"></i>
            <span className="userIcon">
              <PiDotsThreeCircleDuotone />
            </span>
          </div>
        </div>
      )}
    </div>
  )
}



export default Dashboard
