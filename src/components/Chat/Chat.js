import { useQuery } from "@tanstack/react-query";
import "./Chat.scss";
import profilePicture from "../../helper_functions/profilePicture";
import { useNavigate } from "react-router-dom";
import useAxiosConfig from "../../api/useAxiosConfig";
import { getUser } from "../../apiCalls";
import OnlineUser from "../Online User/OnlineUser";
import { useAuth } from "../../context/AuthContext";

function ChatList({ friendId }) {
  const navigate = useNavigate();

  const { dispatch, socket } = useAuth();

  const {
    status,
    data: user,
    error,
  } = useQuery({
    queryKey: ["get-user", friendId],
    queryFn: () => getUser(api, friendId),
  });

  const api = useAxiosConfig(user, dispatch, socket);

  function handleConversation() {
    navigate("/conversation", { state: user });
  }

  if (status === "loading") {
    return <span>Loading...</span>;
  }

  if (status === "error") {
    return <span>Error: {error.response.data}</span>;
  }

  console.log({ errorIs: error });

  const profile_picture = profilePicture(user);

  return (
    <div className="chat">
      <OnlineUser profilePicture={profile_picture} userId={friendId} />
      <p className="margin-left">{user?.username}</p>
      <button className="button" onClick={handleConversation}>
        View Chat
      </button>
    </div>
  );
}

export default ChatList;
