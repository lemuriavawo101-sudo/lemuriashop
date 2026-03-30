import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCgBlARZW4ac9wke9v9bhuhNI8Z2uR6Ebc",
  authDomain: "lemuriashop-adaba.firebaseapp.com",
  projectId: "lemuriashop-adaba",
  storageBucket: "lemuriashop-adaba.firebasestorage.app",
  messagingSenderId: "124786945620",
  appId: "1:124786945620:web:9957007ca337d512d987c1",
  measurementId: "G-ME9JC5M0FH"
};

// Initialize Firebase (SSR-safe)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
