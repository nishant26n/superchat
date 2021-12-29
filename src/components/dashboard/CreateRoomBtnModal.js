import React, { useCallback, useRef, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Notification,
  Schema,
  toaster,
} from "rsuite";
import FormGroup from "rsuite/esm/FormGroup";
import { useModalState } from "../../misc/custom-hook";
import firebase from "firebase/compat/app";
import { database } from "../../misc/firebase";

const Textarea = React.forwardRef((props, ref) => (
  <Input {...props} as="textarea" ref={ref} />
));

const { StringType } = Schema.Types;

const model = Schema.Model({
  name: StringType().isRequired("Chat name is required"),
  description: StringType().isRequired("Description is required"),
});

const INITIAL_FORM = {
  name: "name",
  description: "description",
};

const CreateRoomBtnModal = () => {
  const { isOpen, open, close } = useModalState();

  const [formValue, setFormValue] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef();

  const onFormChange = useCallback((value) => {
    setFormValue(value);
  }, []);

  const onSubmit = async () => {
    if (!formRef.current.check()) {
      return;
    }
    setIsLoading(true);

    const newRoomData = {
      ...formValue,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    };
    try {
      await database.ref("rooms").push(newRoomData);
      toaster.push(
        <Notification type="success" duration={4000}>
          {formValue.name} has been created 🤙
        </Notification>
      );
      setIsLoading(false);
      setFormValue(INITIAL_FORM);
      close();
    } catch (err) {
      setIsLoading(false);
      toaster.push(
        <Notification type="error" duration={4000}>
          {err.message} 🤨
        </Notification>
      );
    }
  };

  return (
    <div className="mt-1">
      <Button block color="green" appearance="primary" onClick={open}>
        <i className="fas fa-comment-alt"></i> Create new chat room
      </Button>

      <Modal open={isOpen} onClose={close}>
        <Modal.Header>
          <Modal.Title>New chat room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            fluid
            onChange={onFormChange}
            formValue={formValue}
            model={model}
            ref={formRef}
          >
            <FormGroup>
              <Form.ControlLabel>Room name</Form.ControlLabel>
              <Form.Control name="name" placeholder="Enter chat room name..." />
            </FormGroup>

            <FormGroup>
              <Form.ControlLabel>Description</Form.ControlLabel>
              <Form.Control
                name="description"
                accepter={Textarea}
                rows={5}
                placeholder="Enter room description..."
              />
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            block
            appearance="primary"
            onClick={onSubmit}
            disabled={isLoading}
          >
            Create new chat room
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateRoomBtnModal;
