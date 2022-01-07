import React, { memo } from "react";
import { useParams } from "react-router-dom";
import { Button, Drawer, Notification, toaster } from "rsuite";
import { useCurrentRoom } from "../../../context/current-room.context";
import { useMediaQuery, useModalState } from "../../../misc/custom-hook";
import { database } from "../../../misc/firebase";
import EditableInput from "../../EditableInput";

const EditRoomBtnDrawer = () => {
  const { isOpen, open, close } = useModalState();

  const name = useCurrentRoom((v) => v.name);
  const description = useCurrentRoom((v) => v.description);

  const { chatId } = useParams();

  const isMobile = useMediaQuery(`(max-width: 992px)`);

  const updateData = (key, value) => {
    database
      .ref(`/rooms/${chatId}`)
      .child(key)
      .set(value)
      .then(() => {
        toaster.push(
          <Notification type="success" duration={4000}>
            Successfully updated 😇
          </Notification>
        );
      })
      .catch((err) => {
        toaster.push(
          <Notification type="error" duration={4000}>
            {err.message} 🤨
          </Notification>
        );
      });
  };

  const onNameSave = (newName) => {
    updateData("name", newName);
  };

  const onDescriptionSave = (newDescription) => {
    updateData("description", newDescription);
  };

  return (
    <div>
      <Button
        className="br-circle"
        size="sm"
        color="green"
        appearance="primary"
        onClick={open}
      >
        A
      </Button>

      <Drawer full={isMobile} open={isOpen} onClose={close} placement="right">
        <Drawer.Header>
          <Drawer.Title>Edit Room</Drawer.Title>
          <Button onClick={close} color="red" appearance="primary">
            Close
          </Button>
        </Drawer.Header>
        <Drawer.Body>
          <EditableInput
            initialValue={name}
            onSave={onNameSave}
            label={<h6 className="mb-2">Name</h6>}
            emptymsg="Message can not be empty"
          />

          <EditableInput
            as="textarea"
            rows={5}
            initialValue={description}
            onSave={onDescriptionSave}
            emptymsg="Description can not be empty"
            wrapperClassName="mt-3"
          />
        </Drawer.Body>
      </Drawer>
    </div>
  );
};

export default memo(EditRoomBtnDrawer);
