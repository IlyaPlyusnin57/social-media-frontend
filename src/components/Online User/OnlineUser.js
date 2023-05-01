import "./OnlineUser.scss";
import { useAuth } from "../../context/AuthContext";

function OnlineUser({ profilePicture, userId }) {
  const { onlineFriends } = useAuth();

  const isOnline = onlineFriends?.has(userId);

  return (
    <div className="online-user">
      <img src={profilePicture} alt="" />
      {isOnline && <span className="circle"></span>}
    </div>
  );
}

export default OnlineUser;
