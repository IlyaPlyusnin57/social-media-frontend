import PlaceIcon from "@mui/icons-material/Place";
import SchoolIcon from "@mui/icons-material/School";

import "./Header.scss";
import { useAuth } from "../../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import OnlineUser from "../../Online User/OnlineUser";
import useAxiosConfig from "../../../api/useAxiosConfig";
import {
  getFollowingStatus,
  followUser,
  unfollowUser,
} from "../../../apiCalls";

function Header({ user, profile_picture }) {
  const { user: currentUser, dispatch, socket } = useAuth();

  const onlineUser = user._id === currentUser._id ? currentUser : user;

  const api = useAxiosConfig(currentUser, dispatch, socket);

  const { data: isFollowing, refetch } = useQuery({
    queryKey: ["following-user"],
    queryFn: () => getFollowingStatus(api, user, currentUser),
    enabled: user._id !== currentUser._id,
  });

  useEffect(() => {
    console.log(`isFollowing is ${isFollowing}`);
  }, [isFollowing]);

  return (
    <section className="header">
      <OnlineUser profilePicture={profile_picture} userId={onlineUser._id} />
      <div className="header-info">
        <div className="user-name">{user.username}</div>
        <div className="user-info">
          <div className="user-info-item">
            <PlaceIcon className="user-icon" />
            <div className="location">Athens</div>
          </div>
          <div className="user-info-item">
            <SchoolIcon className="user-icon" />
            <div className="school">University of Sparta</div>
          </div>
        </div>
        {user._id !== currentUser._id && (
          <div className="user-contact">
            <button className="btn">
              {isFollowing ? (
                <span
                  onClick={() => unfollowUser(api, user, currentUser, refetch)}
                >
                  Unfollow
                </span>
              ) : (
                <span
                  onClick={() =>
                    followUser(api, user, currentUser, refetch, socket)
                  }
                >
                  Follow
                </span>
              )}
            </button>
          </div>
        )}
      </div>
      {/* <div className="btn-wrapper">
        {currentUser._id === user._id && (
          <button className="header-btn" onClick={handleFriends}>
            Update Profile
          </button>
        )}
      </div> */}
    </section>
  );
}

export default Header;
