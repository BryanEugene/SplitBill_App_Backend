// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlaJL0EGs7BFvEHIW_E8eDF8PEU40RBpU",
  authDomain: "splitbillsapps.firebaseapp.com",
  projectId: "splitbillsapps",
  storageBucket: "splitbillsapps.firebasestorage.app",
  messagingSenderId: "807403214408",
  appId: "1:807403214408:web:3d79d8b28d8c5b69ce6a7d",
  measurementId: "G-PPPMQRYXSX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// 
// const analytics = getAnalytics(app);
export default app;