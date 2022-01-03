import React, { useCallback } from "react";
import { Button, Drawer, toaster, Notification } from "rsuite";
import Dashboard from ".";
import { isOfflineForDatabase } from "../../context/profile.context";
import { useMediaQuery, useModalState } from "../../misc/custom-hook";
import { auth, database } from "../../misc/firebase";

const DashboardToggle = () => {
  const { isOpen, open, close } = useModalState();
  const isMobile = useMediaQuery("(max-width: 992px)");

  const onSignOut = useCallback(() => {
    database
      .ref(`status/${auth.currentUser.uid}`)
      .set(isOfflineForDatabase)
      .then(() => {
        auth.signOut();

        toaster.push(
          <Notification type="success" duration={4000}>
            Signed Out 🤙
          </Notification>,
          { placement: "topCenter" }
        );
        close();
      })
      .catch((err) => {
        toaster.push(
          <Notification type="error" duration={4000}>
            {err.message} 🤨
          </Notification>,
          { placement: "topCenter" }
        );
      });
  }, [close]);

  return (
    <>
      <Button appearance="primary" block onClick={open}>
        <i className="fas fa-columns"></i> Dashboard
      </Button>

      <Drawer full={isMobile} open={isOpen} onClose={close} placement="left">
        <Dashboard onSignOut={onSignOut} />
      </Drawer>
    </>
  );
};

export default DashboardToggle;
