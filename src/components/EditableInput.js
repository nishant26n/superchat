import React, { useCallback, useState } from "react";
import { Input, InputGroup, toaster, Notification } from "rsuite";

const EditableInput = ({
  initialValue,
  onSave,
  label = null,
  placeholder = "Write your name",
  emptymsg = "Input is empty",
  wrapperClassName = "",
  ...inputProps
}) => {
  const [input, setInput] = useState(initialValue);
  const [isEditable, setIsEditable] = useState(false);

  const onInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  const onEditClick = useCallback(() => {
    setIsEditable((p) => !p);
    setInput(initialValue);
  }, [initialValue]);

  const onSaveClick = async () => {
    const trimmed = input.trim();

    if (trimmed === "") {
      toaster.push(
        <Notification type="info" duration={4000}>
          {emptymsg} 🤨
        </Notification>,
        { placement: "topCenter" }
      );
    }

    if (trimmed !== initialValue) {
      await onSave(trimmed);
    }

    setIsEditable(false);
  };

  return (
    <div className={wrapperClassName}>
      {label}
      <InputGroup>
        <Input
          {...inputProps}
          disabled={!isEditable}
          placeholder={placeholder}
          value={input}
          onChange={onInputChange}
        />
        <InputGroup.Button onClick={onEditClick}>
          <i className={isEditable ? "fas fa-times" : "fas fa-user-edit"}></i>
        </InputGroup.Button>

        {isEditable && (
          <InputGroup.Button onClick={onSaveClick}>
            <i className={isEditable ? "fas fa-check" : "fas fa-user-edit"}></i>
          </InputGroup.Button>
        )}
      </InputGroup>
    </div>
  );
};

export default EditableInput;
