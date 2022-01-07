import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Notification, toaster } from "rsuite";
import { auth, database, storage } from "../../../misc/firebase";
import { groupBy, transformToArrWithId } from "../../../misc/helper";
import MessageItem from "./MessageItem";

const PAGE_SIZE = 15;
const messageRef = database.ref("/messages");

function shouldScrollToBottom(node, threshold = 30) {
  const percntage =
    (100 * node.scrollTop) / (node.scrollHeight - node.clientHeight) || 0;

  return percntage > threshold;
}

const Messages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const selfRef = useRef();

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  const loadMessages = useCallback(
    (limitToLast) => {
      const node = selfRef.current;
      messageRef.off();

      messageRef
        .orderByChild("roomId")
        .equalTo(chatId)
        .limitToLast(limitToLast || PAGE_SIZE)
        .on("value", (snap) => {
          const data = transformToArrWithId(snap.val());
          setMessages(data);

          if (shouldScrollToBottom(node)) {
            node.scrollTop = node.scrollHeight;
          }
        });

      setLimit((p) => p + PAGE_SIZE);
    },
    [chatId]
  );

  const onLoadMore = useCallback(() => {
    const node = selfRef.current;
    const oldHeight = node.scrollHeight;

    loadMessages(limit);

    setTimeout(() => {
      const newHeight = node.scrollHeight;
      node.scrollTop = newHeight - oldHeight;
    }, 200);
  }, [loadMessages, limit]);

  useEffect(() => {
    const node = selfRef.current;

    loadMessages();

    setTimeout(() => {
      node.scrollTop = node.scrollHeight;
    }, 200);

    return () => {
      messageRef.off("value");
    };
  }, [loadMessages]);

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
    async (msgId, file) => {
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
        return toaster.push(
          <Notification type="error" duration={4000}>
            {err.message} 🤨
          </Notification>
        );
      }

      if (file) {
        try {
          const fileRef = storage.refFromURL(file.url);
          await fileRef.delete();
        } catch (err) {
          toaster.push(
            <Notification type="error" duration={4000}>
              {err.message} 🤨
            </Notification>
          );
        }
      }
    },
    [chatId, messages]
  );

  const renderMessages = () => {
    const groups = groupBy(messages, (item) =>
      new Date(item.createdAt).toDateString()
    );

    const items = [];

    Object.keys(groups).forEach((date) => {
      items.push(
        <li key={date} className="text-center mb-1 padded">
          {date}
        </li>
      );

      const msgs = groups[date].map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          handleAdmin={handleAdmin}
          handleLike={handleLike}
          handleDelete={handleDelete}
        />
      ));

      items.push(...msgs);
    });

    return items;
  };

  return (
    <ul ref={selfRef} className="msg-list custom-scroll">
      {messages && messages.length >= PAGE_SIZE && (
        <li className="text-center mt-2 mb-2">
          <Button onClick={onLoadMore} color="green" appearance="primary">
            Load more
          </Button>
        </li>
      )}
      {isChatEmpty && <li>No messages yet</li>}
      {canShowMessages && renderMessages()}
    </ul>
  );
};

export default Messages;
