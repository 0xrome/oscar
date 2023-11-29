import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// Your web app's Firebase configuration
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
const db = getFirestore(app); // Initializing Firestore here
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { auth, db }; // Exporting Firestore instance as 'db'
