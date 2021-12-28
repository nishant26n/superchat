import React from "react";
import { Button, Divider, Drawer, Notification, toaster } from "rsuite";
import { useProfile } from "../../context/profile.context";
import { database } from "../../misc/firebase";
import EditableInput from "../EditableInput";

const Dashboard = ({ onSignOut }) => {
  const { profile } = useProfile();

  const onSave = async (newData) => {
    const userNicknameRef = database
      .ref(`/profiles/${profile.uid}`)
      .child("name");

    try {
      await userNicknameRef.set(newData);
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
        <Divider />
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
