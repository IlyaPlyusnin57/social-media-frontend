import { useNavigate } from "react-router-dom";
import profilePicture from "../../helper_functions/profilePicture";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import ChatModal from "../../components/ChatModal/ChatModal";
import { createPortal } from "react-dom";
import { getConversation } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import OnlineUser from "../../components/Online User/OnlineUser";

function Sub({ friend }) {
  const navigate = useNavigate();
  const [chatModal, setChatModal] = useState(false);
  const profile_picture = profilePicture(friend);
  const { user: currentUser } = useAuth();
  const api = useAxiosConfig2();

  function handleSub(friend) {
    navigate("/search-profile", { state: friend });
  }

  function handleConversation() {
    navigate("/conversation", { state: friend });
  }

  function handleChat() {
    setChatModal(true);
  }

  const {
    status,
    data: conv,
    error,
    refetch,
  } = useQuery({
    queryFn: () => getConversation(api, friend?._id, currentUser._id),
    queryKey: ["conv", currentUser._id, friend?._id],
    refetchOnWindowFocus: false,
  });

  if (status === "loading") {
    return <span>Loading...</span>;
  }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div className="sub">
      <div className="left-sub" onClick={() => handleSub(friend)}>
        <OnlineUser profilePicture={profile_picture} userId={friend._id} />
        <div className="vertical-center margin-left">
          {friend.first_name} {friend.last_name}
        </div>
      </div>

      <div className="vertical-center">
        {conv === null ? (
          <button onClick={handleChat} className="button">
            Start a Chat
          </button>
        ) : (
          <button className="button" onClick={() => handleConversation()}>
            View Chat
          </button>
        )}
      </div>
      {chatModal &&
        createPortal(
          <ChatModal
            onClose={() => setChatModal(false)}
            friend={friend}
            refetch={refetch}
          />,
          document.body
        )}
    </div>
  );
}

export default Sub;
