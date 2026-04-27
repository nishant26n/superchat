import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { database } from "../misc/firebase";

/**
 * PresenceContext deduplicates Firebase /status/{uid} listeners.
 * Instead of each PresenceDot opening its own listener (N per message),
 * this context maintains a single listener per unique UID seen in the session.
 */
const PresenceContext = createContext({});

export const PresenceProvider = ({ children }) => {
  const [presenceMap, setPresenceMap] = useState({});
  // Track active refs so we can clean them up and avoid duplicates
  const listenersRef = useRef({});

  const subscribeToUID = useCallback((uid) => {
    // Already subscribed — reuse the existing listener
    if (listenersRef.current[uid]) return;

    const ref = database.ref(`/status/${uid}`);
    listenersRef.current[uid] = ref;

    ref.on("value", (snap) => {
      if (snap.exists()) {
        setPresenceMap((prev) => ({ ...prev, [uid]: snap.val() }));
      }
    });
  }, []);

  // Cleanup all listeners on unmount
  useEffect(() => {
    const listeners = listenersRef.current;
    return () => {
      Object.values(listeners).forEach((ref) => ref.off());
    };
  }, []);

  return (
    <PresenceContext.Provider value={{ presenceMap, subscribeToUID }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresenceContext = () => useContext(PresenceContext);
