// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnrD01g1rsjkqce27-TxGnDbxGgy7ZAU0",
  authDomain: "eventmanagement-59f7a.firebaseapp.com",
  databaseURL: "https://eventmanagement-59f7a-default-rtdb.firebaseio.com",
  projectId: "eventmanagement-59f7a",
  storageBucket: "eventmanagement-59f7a.appspot.com",
  messagingSenderId: "594567927551",
  appId: "1:594567927551:web:f15f2be3748b6bdc0d9eca",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);
