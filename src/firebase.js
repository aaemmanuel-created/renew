// ─── Firebase Configuration ───
// Replace the values below with your Firebase project credentials
// Get these from: Firebase Console → Project Settings → Your apps → Web app
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_glsVu3boO7sKHB-_xFl_pR7Jhz5YY6k",
  authDomain: "renew-41486.firebaseapp.com",
  projectId: "renew-41486",
  storageBucket: "renew-41486.firebasestorage.app",
  messagingSenderId: "990899796803",
  appId: "1:990899796803:web:ace605e659933933d88df6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
