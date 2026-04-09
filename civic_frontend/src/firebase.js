import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCR7Egfv-H_tPjlohCZu4FW7O-6qk3sqyI',
  authDomain: 'crowdsourced-civic-lssue.firebaseapp.com',
  projectId: 'crowdsourced-civic-lssue',
  storageBucket: 'crowdsourced-civic-lssue.firebasestorage.app',
  messagingSenderId: '557351724337',
  appId: '1:557351724337:web:74d9cb0f788353ce0cfc10',
  measurementId: 'G-4F41ZN15L1',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
