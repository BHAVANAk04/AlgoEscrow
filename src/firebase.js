// src/firebase.js (CORRECTED FOR REALTIME DATABASE)

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // <-- Import Realtime Database service

const firebaseConfig = {
  apiKey: "AIzaSyBc7x8gddDmeCztU8S0TStIbj3VUg5I6Gk",
  authDomain: "algoescrow.firebaseapp.com",
  // ⚠️ You MUST add your Realtime Database URL here
  databaseURL: "https://algoescrow-default-rtdb.firebaseio.com", // <-- EXAMPLE URL, FIND YOURS
  projectId: "algoescrow",
  storageBucket: "algoescrow.firebasestorage.app",
  messagingSenderId: "112755487139",
  appId: "1:112755487139:web:17ffd1a212ffcbe95dea16",
  measurementId: "G-XSXPX5Z2CN"
};

const app = initializeApp(firebaseConfig);
// Initialize and export the Realtime Database instance
export const db = getDatabase(app); 
export default app;