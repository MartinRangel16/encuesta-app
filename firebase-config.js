// firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyBbQ9V1EeAMFqShg_ScqO3ALE2UsGXRSjc",
    authDomain: "encuestashanty12.firebaseapp.com",
    projectId: "encuestashanty12",
    storageBucket: "encuestashanty12.firebasestorage.app",
    messagingSenderId: "692171791223",
    appId: "1:692171791223:web:f1e799d155820ac7389f72",
    measurementId: "G-MF4K1QHYXG"
    };
// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Inicialización explícita
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exporta los servicios que necesites
export { db };
