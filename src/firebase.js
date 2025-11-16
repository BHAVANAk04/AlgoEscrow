// src/firebase.js (CORRECTED FOR FIRESTORE)

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBc7x8gddDmeCztU8S0TStIbj3VUg5I6Gk",
  authDomain: "algoescrow.firebaseapp.com",
  projectId: "algoescrow",
  storageBucket: "algoescrow.appspot.com",
  messagingSenderId: "112755487139",
  appId: "1:112755487139:web:17ffd1a212ffcbe95dea16",
  measurementId: "G-XSXPX5Z2CN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;