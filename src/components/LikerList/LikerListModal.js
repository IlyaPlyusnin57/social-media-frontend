import "./LikerListModal.scss";
import DisplayUser from "../DisplayUser/DisplayUser";
import { useNavigate } from "react-router-dom";
import profilePicture from "../../helper_functions/profilePicture";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";

function LikerListModal({ userList, message, removeModal, userName }) {
  const navigate = useNavigate();

  function handleSearchUser(user) {
    navigate("/search-profile", { state: user });
  }

  useEffect(() => {
    return () => {
      removeModal();
    };
  }, [removeModal]);

  return (
    <div className="liker-list-modal-container">
      <div className="liker-list-modal">
        <div className="close-icon-wrapper">
          <CloseIcon className="pointer" onClick={removeModal} />
        </div>
        <h2 className="list-modal-header">
          {userList.length} {userList.length > 1 ? userName + "s" : userName}{" "}
          {message}
        </h2>

        <section className="user-list">
          {userList.map((user) => {
            const profile_picture = profilePicture(user);

            return (
              <DisplayUser
                key={user._id}
                {...{ handleSearchUser, user, profile_picture }}
              />
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default LikerListModal;
