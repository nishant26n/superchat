import { createContext, useContext, useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import { auth, database } from "../misc/firebase";

export const isOfflineForDatabase = {
  state: "offline",
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const isOnlineForDatabase = {
  state: "online",
  last_changed: firebase.database.ServerValue.TIMESTAMP,
};

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let userRef;
    let userStatusRef;
    let connectedRef;

    const authUnSub = auth.onAuthStateChanged((authObj) => {
      if (authObj) {
        userStatusRef = database.ref(`/status/${authObj.uid}`);
        userRef = database.ref(`/profiles/${authObj.uid}`);
        connectedRef = database.ref(".info/connected");

        userRef.on("value", (snap) => {
          const { name, createdAt, avatar } = snap.val();

          const data = {
            name,
            createdAt,
            avatar,
            uid: authObj.uid,
            email: authObj.email,
          };
          setProfile(data);
          setIsLoading(false);
        });

        connectedRef.on("value", (snapshot) => {
          if (!snapshot.val()) {
            return;
          }

          userStatusRef
            .onDisconnect()
            .set(isOfflineForDatabase)
            .then(() => {
              userStatusRef.set(isOnlineForDatabase);
            });
        });
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    // Single consolidated cleanup — handles both sign-out and unmount
    return () => {
      authUnSub();
      if (userRef) userRef.off();
      if (userStatusRef) userStatusRef.off();
      if (connectedRef) connectedRef.off();
    };
  }, []);

  return (
    // Fixed typo: isloading → isLoading (matches what PrivateRoute/PublicRoute expect)
    <ProfileContext.Provider value={{ isLoading, profile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
