import "./ChatList.scss";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import Chat from "../../components/Chat/Chat";
import { getConversations } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";

function Chats() {
  const { user } = useAuth();
  const api = useAxiosConfig2();

  const { status, data, error } = useQuery({
    queryKey: ["convos"],
    queryFn: () => getConversations(api, user),
    refetchOnWindowFocus: false,
  });

  if (status === "loading") {
    return <span>Loading...</span>;
  }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div className="chats">
      {data.map((conv, i) => {
        const friendId = conv.participants.find(
          (userId) => userId !== user._id
        );

        return <Chat friendId={friendId} key={i} />;
      })}
    </div>
  );
}

export default Chats;
