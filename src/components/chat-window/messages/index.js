import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Notification, toaster } from "rsuite";
import { auth, database } from "../../../misc/firebase";
import { transformToArrWithId } from "../../../misc/helper";
import MessageItem from "./MessageItem";

const Messages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  useEffect(() => {
    const messageRef = database.ref("/messages");
    messageRef
      .orderByChild("roomId")
      .equalTo(chatId)
      .on("value", (snap) => {
        const data = transformToArrWithId(snap.val());
        setMessages(data);

        return () => {
          messageRef.off("value");
        };
      });
  }, [chatId]);

  const handleAdmin = useCallback(
    async (uid) => {
      const adminRef = database.ref(`rooms/${chatId}/admins`);

      let alertMsg;

      await adminRef.transaction((admins) => {
        if (admins) {
          if (admins[uid]) {
            admins[uid] = null;
            alertMsg = "Admin permission removed";
          } else {
            admins[uid] = true;
            alertMsg = "Admin permission granted";
          }
        }
        return admins;
      });

      toaster.push(
        <Notification type="info" duration={4000}>
          {alertMsg} 😏
        </Notification>
      );
    },
    [chatId]
  );

  const handleLike = useCallback(async (msgId) => {
    const { uid } = auth.currentUser;
    const messageRef = database.ref(`messages/${msgId}`);

    await messageRef.transaction((msg) => {
      if (msg) {
        if (msg.likes && msg.likes[uid]) {
          msg.likeCount -= 1;
          msg.likes[uid] = null;
        } else {
          msg.likeCount += 1;

          if (!msg.likes) {
            msg.likes = {};
          }

          msg.likes[uid] = true;
        }
      }
      return msg;
    });
  }, []);

  const handleDelete = useCallback(
    async (msgId) => {
      if (!window.confirm("Delete this message?")) {
        return;
      }

      const isLast = messages[messages.length - 1].id === msgId;

      const updates = {};

      updates[`/messages/${msgId}`] = null;

      if (isLast && messages.length > 1) {
        updates[`/rooms/${chatId}/lastMessage`] = {
          ...messages[messages.length - 2],
          msgId: messages[messages.length - 2].id,
        };
      }

      if (isLast && messages.length === 1) {
        updates[`/rooms/${chatId}/lastMessage`] = null;
      }

      try {
        await database.ref().update(updates);
        toaster.push(
          <Notification type="error" duration={4000}>
            Message has been deleted 🥲
          </Notification>
        );
      } catch (err) {
        toaster.push(
          <Notification type="error" duration={4000}>
            {err.message} 🤨
          </Notification>
        );
      }
    },
    [chatId, messages]
  );

  return (
    <ul className="msg-list custom-scroll">
      {isChatEmpty && <li>No messages yet</li>}
      {canShowMessages &&
        messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            handleAdmin={handleAdmin}
            handleLike={handleLike}
            handleDelete={handleDelete}
          />
        ))}
    </ul>
  );
};

export default Messages;
