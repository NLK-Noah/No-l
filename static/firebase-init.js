// Import Firebase App (obligatoire)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

// Import Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Configuration Firebase générée par la console
const firebaseConfig = {
    apiKey: "AIzaSyBVQh_y9U1D5gA7BmCCFJgOlEPlUAogxV8",
    authDomain: "santa-secret-3c1f4.firebaseapp.com",
    projectId: "santa-secret-3c1f4",
    storageBucket: "santa-secret-3c1f4.firebasestorage.app",
    messagingSenderId: "238129661360",
    appId: "1:238129661360:web:d6ccb73539dc67d9f68275"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Initialisation Firestore
export const db = getFirestore(app);
