import "./Followers.scss";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import profilePicture from "../../../helper_functions/profilePicture";
import useAxiosConfig2 from "../../../api/useAxiosConfig2";
import { memo, useState } from "react";
import { getFollowers } from "../../../apiCalls";
import { createPortal } from "react-dom";
import LikerListModal from "../../LikerList/LikerListModal";

const Followers = memo(({ user }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const api = useAxiosConfig2();

  function handleSearchUser(user) {
    navigate("/search-profile", { state: user });
  }

  const {
    data: followersArr,
    status,
    error,
  } = useQuery({
    queryKey: ["followers", user],
    queryFn: () => getFollowers(api, user),
    refetchOnWindowFocus: false,
  });

  if (status === "loading") {
    return <span>Loading...</span>;
  }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  const shortFollowersArr = followersArr.slice(0, 3);

  if (shortFollowersArr.length === 0) {
    return;
  }

  const userName = "Follower";
  const message = "";

  return (
    <div className="subs">
      <h4>Followers</h4>

      {shortFollowersArr?.map((user, i) => {
        const profile_picture = profilePicture(user);

        return (
          <div
            key={i}
            className="sub-image pointer"
            onClick={() => handleSearchUser(user)}
          >
            <img src={profile_picture} alt="" />
            <div style={{ fontSize: "10px" }} className="sub-user-name">
              {user?.first_name}
            </div>
          </div>
        );
      })}
      <div className="view-all pointer" onClick={() => setShowModal(true)}>
        View All
      </div>
      {showModal &&
        createPortal(
          <LikerListModal
            {...{
              userList: followersArr,
              message,
              userName,
              removeModal: () => setShowModal(false),
            }}
          />,
          document.body
        )}
    </div>
  );
});

export default Followers;
