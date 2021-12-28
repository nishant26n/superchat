import React, { useState } from "react";
import firebase from "firebase/compat/app";
import { Button, Notification, Tag, toaster } from "rsuite";
import { auth } from "../../misc/firebase";

const ProviderBlock = () => {
  const [isConnected, setIsConnnected] = useState({
    "google.com": auth.currentUser.providerData.some(
      (data) => data.providerId === "google.com"
    ),
    "github.com": auth.currentUser.providerData.some(
      (data) => data.providerId === "github.com"
    ),
  });

  const updateIsConnected = (providerId, value) => {
    setIsConnnected((p) => {
      return {
        ...p,
        [providerId]: value,
      };
    });
  };

  const unlink = (providerId) => {
    try {
      if (auth.currentUser.providerData.length === 1) {
        throw new Error(`You cannot disconnected from ${providerId}`);
      }

      auth.currentUser.unlink(providerId);
      updateIsConnected(providerId, false);
      toaster.push(
        <Notification type="info" duration={4000}>
          Disconnected from {providerId} 🚫
        </Notification>
      );
    } catch (err) {
      toaster.push(
        <Notification type="info" duration={4000}>
          {err.message} 🤨
        </Notification>,
        { placement: "topCenter" }
      );
    }
  };

  const unLinkGoogle = () => {
    unlink("google.com");
  };
  const unLinkGithub = () => {
    unlink("github.com");
  };

  const link = async (provider) => {
    try {
      await auth.currentUser.linkWithPopup(provider);
      toaster.push(
        <Notification type="info" duration={4000}>
          Linked with {provider.providerId} 👊
        </Notification>
      );
    } catch (err) {
      toaster.push(
        <Notification type="info" duration={4000}>
          {err.message} 🤨
        </Notification>
      );
    }
  };

  const linkGoogle = () => {
    link(new firebase.auth.GoogleAuthProvider());
  };
  const linkGithub = () => {
    link(new firebase.auth.GithubAuthProvider());
  };

  return (
    <div>
      {isConnected["google.com"] && (
        <Tag color="green" closable onClose={unLinkGoogle}>
          <i className="fab fa-google"></i> Google
        </Tag>
      )}
      {isConnected["github.com"] && (
        <Tag color="violet" closable onClose={unLinkGithub}>
          <i className="fab fa-github"></i> Github
        </Tag>
      )}

      <div className="mt-2">
        {!isConnected["google.com"] && (
          <Button appearance="primary" color="green" block onClick={linkGoogle}>
            <i className="fab fa-google"></i> Link to Google
          </Button>
        )}

        {!isConnected["github.com"] && (
          <Button
            appearance="primary"
            color="violet"
            block
            onClick={linkGithub}
          >
            <i className="fab fa-github"></i> Link to Github
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProviderBlock;
