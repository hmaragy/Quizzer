// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "localhost",
  databaseURL: "quizzer-2600.firebaseio.com",
  projectId: "quizzer-2600",
  appId: "quizzer-2600",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

export default app;
export const auth = app.auth();
export const f = firebase;
export const db = firebase.firestore();
