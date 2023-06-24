import "./OnlineUser.scss";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { getUser } from "../../apiCalls";

function OnlineUser({ profilePicture, userId, backgroundColor }) {
  const { onlineFriends } = useAuth();
  const navigate = useNavigate();
  const api = useAxiosConfig2();

  const style = {};

  async function navigateToUser() {
    const user = await getUser(api, userId);
    navigate("/search-profile", { state: user });
  }

  if (backgroundColor) style["border"] = `3px solid ${backgroundColor}`;

  const isOnline = onlineFriends?.has(userId);

  return (
    <div className="online-user" onClick={navigateToUser}>
      <img src={profilePicture} alt="" />
      {isOnline && <span className="circle" style={style}></span>}
    </div>
  );
}

export default OnlineUser;
