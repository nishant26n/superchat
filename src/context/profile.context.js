import { createContext, useContext, useEffect, useState } from "react";
import { auth, database } from "../misc/firebase";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [isloading, setIsLoading] = useState(true);

  useEffect(() => {
    let useRef;

    const authUnSub = auth.onAuthStateChanged((authObj) => {
      if (authObj) {
        useRef = database.ref(`/profiles/${authObj.uid}`);

        useRef.on("value", (snap) => {
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
      } else {
        if (useRef) {
          useRef.off();
        }
        setProfile(null);
        setIsLoading(false);
      }
    });
    return () => {
      authUnSub();
    };
  }, []);

  return (
    <ProfileContext.Provider value={{ isloading, profile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
