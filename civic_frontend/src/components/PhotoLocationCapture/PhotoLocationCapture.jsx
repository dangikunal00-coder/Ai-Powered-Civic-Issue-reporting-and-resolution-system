import React, { useRef, useState } from 'react'
import ExifReader from 'exifreader'
import './PhotoLocationCapture.css'

const PhotoLocationCapture = ({ onCapture }) => {
  const fileInputRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsLoading(true)
    setError('')
    setMessage('Processing image and location...')

    let coords = null

    try {
      const tags = await ExifReader.load(file)

      if (tags.GPSLatitude && tags.GPSLongitude) {
        const latitude = tags.GPSLatitude.description
        const longitude = tags.GPSLongitude.description
        coords = { latitude, longitude, method: 'EXIF' }
        setMessage('Location captured from image metadata.')
      } else {
        setMessage('Image has no GPS data. Requesting device location...')
        coords = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            return reject(
              new Error('Geolocation is not supported by your browser.')
            )
          }
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                method: 'Geolocation',
              })
            },
            (geoError) => {
              reject(new Error(`Geolocation error: ${geoError.message}`))
            }
          )
        })
      }

      const reader = new FileReader()
      reader.onload = () => {
        const imageDataUrl = reader.result
        onCapture(imageDataUrl, coords)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Error during image processing:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="photo-capture-container">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={() => fileInputRef.current.click()}
        disabled={isLoading}
        className="camera-button"
      >
        {isLoading ? 'Processing...' : 'Take Photo & Get Location'}
      </button>
      {message && <p className="status-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
      <p className="privacy-note">
        Please be aware that your location will be attached to the photo.
      </p>
    </div>
  )
}

export default PhotoLocationCapture
