import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDI2h9o_yjr0V_Aia_aoOpQYxUZKr0H_I0",
  authDomain: "sih076-9dc7a.firebaseapp.com",
  projectId: "sih076-9dc7a",
  storageBucket: "sih076-9dc7a.firebasestorage.app",
  messagingSenderId: "695837562961",
  appId: "1:695837562961:web:f5489c005d500ac42e4070",
  measurementId: "G-KKHYC5XTYK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
