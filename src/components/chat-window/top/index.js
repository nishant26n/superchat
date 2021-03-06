import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ButtonToolbar } from "rsuite";
import { useCurrentRoom } from "../../../context/current-room.context";
import { useMediaQuery } from "../../../misc/custom-hook";
import EditRoomBtnDrawer from "./EditRoomBtnDrawer";
import RoomInfoBtnModal from "./RoomInfoBtnModal";
import { FaArrowCircleLeft } from "react-icons/fa";

const ChatTop = () => {
  const name = useCurrentRoom((v) => v.name);
  const isAdmin = useCurrentRoom((v) => v.isAdmin);
  const isMobile = useMediaQuery("(max-width: 992px)");

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <div className="text-disappear d-flex align-items-center">
          <Link
            to="/"
            className={
              isMobile
                ? "d-inline-block p-0 mr-2 text-blue link-unstyled"
                : "d-none"
            }
          >
            <FaArrowCircleLeft className="mt-2" size={30} />
          </Link>
        </div>
        <h4 className="text-disappear text-center" style={{ padding: "5px" }}>
          {name}
        </h4>
        <ButtonToolbar className="ws-nowrap">
          {isAdmin && <EditRoomBtnDrawer />}
        </ButtonToolbar>
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <RoomInfoBtnModal />
      </div>
    </>
  );
};

export default memo(ChatTop);
