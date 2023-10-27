// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAIZaBLrWGI_8rUE0BQVysiyui1EU6j8-c",
  authDomain: "oscar-da63e.firebaseapp.com",
  projectId: "oscar-da63e",
  storageBucket: "oscar-da63e.appspot.com",
  messagingSenderId: "12800967817",
  appId: "1:12800967817:web:4d7df4076a3ab68900f258",
  measurementId: "G-EPEKYDCKCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };