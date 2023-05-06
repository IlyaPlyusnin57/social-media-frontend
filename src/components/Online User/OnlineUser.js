import "./OnlineUser.scss";
import { useAuth } from "../../context/AuthContext";

function OnlineUser({ profilePicture, userId, backgroundColor }) {
  const { onlineFriends } = useAuth();

  const style = {};

  if (backgroundColor) style["border"] = `3px solid ${backgroundColor}`;

  const isOnline = onlineFriends?.has(userId);

  return (
    <div className="online-user">
      <img src={profilePicture} alt="" />
      {isOnline && <span className="circle" style={style}></span>}
    </div>
  );
}

export default OnlineUser;
