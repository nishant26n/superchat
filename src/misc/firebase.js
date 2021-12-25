import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const config = {
  apiKey: "AIzaSyApp2idp4Ms24x-pk24xqVU_H9HXDihXYo",
  authDomain: "chat-web-app-98952.firebaseapp.com",
  databaseURL:
    "https://chat-web-app-98952-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chat-web-app-98952",
  storageBucket: "chat-web-app-98952.appspot.com",
  messagingSenderId: "662151121981",
  appId: "1:662151121981:web:92a3adcb4fbdc77deb2e54",
};

const app = firebase.initializeApp(config);
export const auth = app.auth();
export const database = app.database();
