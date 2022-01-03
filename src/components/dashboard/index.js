import React from "react";
import { Button, Divider, Drawer, Notification, toaster } from "rsuite";
import { useProfile } from "../../context/profile.context";
import { database } from "../../misc/firebase";
import { getUserUpdates } from "../../misc/helper";
import EditableInput from "../EditableInput";
import AvatarUploadBtn from "./AvatarUploadBtn";
import ProviderBlock from "./ProviderBlock";

const Dashboard = ({ onSignOut }) => {
  const { profile } = useProfile();

  const onSave = async (newData) => {
    try {
      const updates = await getUserUpdates(
        profile.uid,
        "name",
        newData,
        database
      );

      await database.ref().update(updates);

      toaster.push(
        <Notification type="success" duration={4000}>
          Nickname has been updated ✌️
        </Notification>,
        { placement: "top-center" }
      );
    } catch (err) {
      toaster.push(
        <Notification type="error" duration={4000}>
          {err.message}
        </Notification>
      );
    }
  };
  return (
    <>
      <Drawer.Header>
        <Drawer.Title>Dashboard</Drawer.Title>
        <Button color="red" appearance="primary" onClick={onSignOut}>
          Sign out
        </Button>
      </Drawer.Header>
      <Drawer.Body>
        <h3>Hey, {profile.name} </h3>
        <ProviderBlock />
        <Divider />
        <AvatarUploadBtn />
        <EditableInput
          name="nickname"
          initialValue={profile.name}
          onSave={onSave}
          label={<h6 className="mb-2">Nickname</h6>}
        />
      </Drawer.Body>
    </>
  );
};

export default Dashboard;
