import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyBDTCh1P_wW8qsbSClQoCS_hXfL158T4nA",
    authDomain: "comment-board-79ea9.firebaseapp.com",
    projectId: "comment-board-79ea9",
    storageBucket: "comment-board-79ea9.appspot.com",
    messagingSenderId: "308161992454",
    appId: "1:308161992454:web:5b57dedcd76c1fab7cf087",
    measurementId: "G-878464LEFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, db, app }