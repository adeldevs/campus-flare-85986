import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBNpdB-bGz1MLBDFMQ9GDqKTj-_9krWRTw",
  authDomain: "events-fc01b.firebaseapp.com",
  projectId: "events-fc01b",
  storageBucket: "events-fc01b.firebasestorage.app",
  messagingSenderId: "821493260837",
  appId: "1:821493260837:web:c33933d41d3888fa6fd5cc",
  measurementId: "G-HBC521ZFDT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
