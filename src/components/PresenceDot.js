import React, { memo, useEffect } from "react";
import { Badge, Tooltip, Whisper } from "rsuite";
import { usePresenceContext } from "../context/presence.context";

const getColor = (presence) => {
  if (!presence) return "gray";
  switch (presence.state) {
    case "online":
      return "green";
    case "offline":
      return "red";
    default:
      return "gray";
  }
};

const getText = (presence) => {
  if (!presence) {
    return "Unknown state";
  }

  return presence.state === "online"
    ? "Online"
    : `Last online ${new Date(presence.last_changed).toLocaleDateString()}`;
};

const PresenceDot = ({ uid }) => {
  // Subscribe this uid to the shared context (no-op if already subscribed)
  const { presenceMap, subscribeToUID } = usePresenceContext();

  useEffect(() => {
    subscribeToUID(uid);
  }, [uid, subscribeToUID]);

  const presence = presenceMap[uid] || null;

  return (
    <Whisper
      placement="top"
      controlId={`presence-${uid}`}
      trigger="hover"
      speaker={<Tooltip>{getText(presence)}</Tooltip>}
    >
      <Badge
        className="cursor-pointer"
        style={{ backgroundColor: getColor(presence) }}
      />
    </Whisper>
  );
};

export default memo(PresenceDot);
