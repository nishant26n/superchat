import React from "react";
import { Avatar } from "rsuite";
import { getNameInitails } from "../../misc/helper";

const ProfileAvatar = ({ name, ...avatarProps }) => {
  return (
    <Avatar circle {...avatarProps}>
      {getNameInitails(name)}
    </Avatar>
  );
};

export default ProfileAvatar;
