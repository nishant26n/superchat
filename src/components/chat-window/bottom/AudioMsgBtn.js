import React, { useState, useCallback } from "react";
import { ReactMic } from "react-mic";
import { InputGroup, Notification, toaster } from "rsuite";
import { FaMicrophone } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { storage } from "../../../misc/firebase";

const AudioMsgBtn = ({ afterUpload }) => {
  const { chatId } = useParams();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onClick = useCallback(() => {
    setIsRecording((p) => !p);
  }, []);

  const onUpload = useCallback(
    async (data) => {
      setIsUploading(true);
      try {
        const snap = await storage
          .ref(`/chat/${chatId}`)
          .child(`audio_${Date.now()}.mp3`)
          .put(data.blob, {
            cacheControl: `public, max-age=${3600 * 24 * 3}`,
          });

        const file = {
          contentType: snap.metadata.contentType,
          name: snap.metadata.name,
          url: await snap.ref.getDownloadURL(),
        };

        setIsUploading(false);
        afterUpload([file]);
      } catch (err) {
        setIsUploading(false);
        toaster.push(
          <Notification type="error" duration={4000}>
            {err.message} 🤨
          </Notification>
        );
      }
    },
    [afterUpload, chatId]
  );

  return (
    <InputGroup.Button
      onClick={onClick}
      disabled={isUploading}
      className={isRecording ? "animate-blink" : ""}
    >
      <FaMicrophone />
      <ReactMic
        record={isRecording}
        className="d-none"
        onStop={onUpload}
        mimeType="audio/mp3"
      />
    </InputGroup.Button>
  );
};

export default AudioMsgBtn;
