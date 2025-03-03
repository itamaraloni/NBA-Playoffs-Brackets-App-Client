// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// The web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOL8f1IhtBMxZdtDnMFBZMo_m2zbW2pJE",
  authDomain: "nba-playoff-prediction-app.firebaseapp.com",
  projectId: "nba-playoff-prediction-app",
  storageBucket: "nba-playoff-prediction-app.firebasestorage.app",
  messagingSenderId: "1018832016110",
  appId: "1:1018832016110:web:eed594e0a93fdad004d9ff",
  measurementId: "G-TSY2NDE5RP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };