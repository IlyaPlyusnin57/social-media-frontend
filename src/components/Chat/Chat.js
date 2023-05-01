import { useQuery } from "@tanstack/react-query";
import "./Chat.scss";
import profilePicture from "../../helper_functions/profilePicture";
import { useNavigate } from "react-router-dom";
import useAxiosConfig from "../../api/useAxiosConfig";
import { getUser } from "../../apiCalls";

function ChatList({ friendId }) {
  const navigate = useNavigate();
  const api = useAxiosConfig();

  const {
    status,
    data: user,
    error,
  } = useQuery({
    queryKey: ["get-user", friendId],
    queryFn: () => getUser(api, friendId),
  });

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
    <div className="chat" onClick={handleConversation}>
      <img src={profile_picture} alt="" />

      <p className="margin-left">{user?.username}</p>
    </div>
  );
}

export default ChatList;
