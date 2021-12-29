import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";

const config = {
  apiKey: "AIzaSyAZc-PHeQ_OBC0TKbCBedqPQXqJc8ay_j0",
  authDomain: "superchat-ccd98.firebaseapp.com",
  databaseURL:
    "https://superchat-ccd98-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "superchat-ccd98",
  storageBucket: "superchat-ccd98.appspot.com",
  messagingSenderId: "522698057635",
  appId: "1:522698057635:web:740674540bcb7c76169c16",
  measurementId: "G-G7KY4BHSDY",
};

const app = firebase.initializeApp(config);
export const auth = app.auth();
export const database = app.database();
export const storage = app.storage();
