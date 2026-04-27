import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { Button, Modal, Notification, toaster } from "rsuite";
import { auth, database, storage } from "../../../misc/firebase";
import { groupBy, transformToArrWithId } from "../../../misc/helper";
import MessageItem from "./MessageItem";

const PAGE_SIZE = 15;
const messageRef = database.ref("/messages");

function shouldScrollToBottom(node, threshold = 30) {
  const percentage =
    (100 * node.scrollTop) / (node.scrollHeight - node.clientHeight) || 0;

  return percentage > threshold;
}

const Messages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState(null); // { msgId, file }
  const selfRef = useRef();
  // Track whether the next messages update should scroll to bottom
  const shouldScrollRef = useRef(true);

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
          shouldScrollRef.current = shouldScrollToBottom(node);
        });

      setLimit((p) => p + PAGE_SIZE);
    },
    [chatId]
  );

  const onLoadMore = useCallback(() => {
    const node = selfRef.current;
    const oldHeight = node.scrollHeight;

    shouldScrollRef.current = false; // loading more — don't jump to bottom
    loadMessages(limit);

    // Restore relative scroll position after new messages are injected at the top
    requestAnimationFrame(() => {
      const newHeight = node.scrollHeight;
      node.scrollTop = newHeight - oldHeight;
    });
  }, [loadMessages, limit]);

  useEffect(() => {
    shouldScrollRef.current = true; // new chat — scroll to bottom
    loadMessages();

    return () => {
      messageRef.off("value");
    };
  }, [loadMessages]);

  // useLayoutEffect fires synchronously after DOM paint — reliable scroll
  useLayoutEffect(() => {
    const node = selfRef.current;
    if (node && shouldScrollRef.current) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

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
    const msgRef = database.ref(`messages/${msgId}`);

    await msgRef.transaction((msg) => {
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

  // Opens confirmation modal instead of blocking window.confirm()
  const handleDelete = useCallback((msgId, file) => {
    setDeleteTarget({ msgId, file });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const { msgId, file } = deleteTarget;
    setDeleteTarget(null);

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
        <Notification type="info" duration={4000}>
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
  }, [chatId, deleteTarget, messages]);

  // Memoized — only recalculates when messages array changes
  const renderedMessages = useMemo(() => {
    if (!canShowMessages) return null;

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
  }, [messages, canShowMessages, handleAdmin, handleLike, handleDelete]);

  return (
    <>
      {/* Non-blocking delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        size="xs"
      >
        <Modal.Header>
          <Modal.Title>Delete message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this message? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={confirmDelete} appearance="primary" color="red">
            Delete
          </Button>
          <Button onClick={() => setDeleteTarget(null)} appearance="subtle">
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <ul ref={selfRef} className="msg-list custom-scroll">
        {messages && messages.length >= PAGE_SIZE && (
          <li className="text-center mt-2 mb-2">
            <Button onClick={onLoadMore} color="green" appearance="primary">
              Load more
            </Button>
          </li>
        )}
        {isChatEmpty && <li>No messages yet</li>}
        {renderedMessages}
      </ul>
    </>
  );
};

export default Messages;
