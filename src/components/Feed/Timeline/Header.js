import PlaceIcon from "@mui/icons-material/Place";
import SchoolIcon from "@mui/icons-material/School";

import "./Header.scss";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import OnlineUser from "../../Online User/OnlineUser";

function Header({ user, profile_picture }) {
  const { user: currentUser } = useAuth();

  const onlineUser = user._id === currentUser._id ? currentUser : user;

  async function getFollowingStatus() {
    console.log("getFollowingStatus ran");
    const res = await axios.post(`users/${user._id}/is-following`, {
      id: currentUser._id,
    });

    return res.data;
  }

  const { data: isFollowing, refetch } = useQuery({
    queryKey: ["following-user"],
    queryFn: getFollowingStatus,
    enabled: user._id !== currentUser._id,
  });

  useEffect(() => {
    console.log(`isFollowing is ${isFollowing}`);
  }, [isFollowing]);

  async function followUser() {
    const res = await axios.patch(`/users/${user._id}/follow`, {
      userId: currentUser._id,
    });
    console.log(res.data);
    refetch();
  }

  async function unfollowUser() {
    const res = await axios.patch(`/users/${user._id}/unfollow`, {
      userId: currentUser._id,
    });

    console.log(res.data);
    refetch();
  }

  function handleFriends() {}

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
                <span onClick={unfollowUser}>Unfollow</span>
              ) : (
                <span onClick={followUser}>Follow</span>
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
