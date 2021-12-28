import React, { useCallback } from "react";
import { Button, Drawer, toaster, Notification } from "rsuite";
import Dashboard from ".";
import { useMediaQuery, useModalState } from "../../misc/custom-hook";
import { auth } from "../../misc/firebase";

const DashboardToggle = () => {
  const { isOpen, open, close } = useModalState();
  const isMobile = useMediaQuery("(max-width: 992px)");

  const onSignOut = useCallback(() => {
    auth.signOut();

    toaster.push(
      <Notification type="success" duration={4000}>
        Signed Out 🤙
      </Notification>,
      { placement: "topCenter" }
    );
    close();
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
