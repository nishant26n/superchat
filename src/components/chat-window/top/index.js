import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ButtonToolbar } from "rsuite";
import { useCurrentRoom } from "../../../context/current-room.context";
import { useMediaQuery } from "../../../misc/custom-hook";
import RoomInfoBtnModal from "./RoomInfoBtnModal";

const ChatTop = () => {
  const name = useCurrentRoom((v) => v.name);
  const isMobile = useMediaQuery("(max-width: 992px)");

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="text-disappear d-flex align-items-center">
          <Link
            to="/"
            className={
              isMobile
                ? "d-inline-block p-0 mr-2 text-blue link-unstyled"
                : "d-none"
            }
          >
            <i className="fas fa-arrow-left"></i>
          </Link>
          <span className="text-disappear">{name}</span>
        </h4>
        <ButtonToolbar className="ws-nowrap">todo</ButtonToolbar>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <span>todo</span>
        <RoomInfoBtnModal />
      </div>
    </div>
  );
};

export default memo(ChatTop);
