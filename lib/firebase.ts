import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB5kXrmJgSFcnxIqQHLWtY5diInLHRbeAc",
  authDomain: "iponion-5ae62.firebaseapp.com",
  projectId: "iponion-5ae62",
  storageBucket: "iponion-5ae62.firebasestorage.app",
  messagingSenderId: "799003447400",
  appId: "1:799003447400:web:6d1d01c8c8c1a46c43ebdd",
  measurementId: "G-8KQTPQ4PY"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
};
