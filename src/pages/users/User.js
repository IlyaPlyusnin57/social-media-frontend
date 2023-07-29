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
import { blockUnblockUser } from "../../apiCalls";

function User({ friend }) {
  const navigate = useNavigate();
  const [chatModal, setChatModal] = useState(false);
  const profile_picture = profilePicture(friend);
  const { user: currentUser, dispatch, socket } = useAuth();
  const api = useAxiosConfig2();
  const [blocked, setBlocked] = useState(
    currentUser?.blocked?.includes(friend._id)
  );

  function handleUser(friend) {
    navigate("/search-profile", { state: friend });
  }

  function handleConversation() {
    navigate("/conversation", { state: friend });
  }

  function handleChat() {
    setChatModal(true);
  }

  async function handleBlockUnblock(isBlocking) {
    const res = await blockUnblockUser(api, {
      isBlocking,
      blocker: currentUser,
      blockedId: friend._id,
    });

    if (res.status === 200) {
      socket?.emit("sendBlockNotification", friend._id, res.data, isBlocking);
      setBlocked(isBlocking);

      if (isBlocking) {
        dispatch({ type: "ADD_BLOCKED_USER", payload: friend._id });
      } else {
        dispatch({ type: "REMOVE_BLOCKED_USER", payload: friend._id });
      }
    }
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
      <div className="left-sub" onClick={() => handleUser(friend)}>
        <OnlineUser profilePicture={profile_picture} userId={friend._id} />
        <div className="vertical-center margin-left underline">
          {friend.username}
        </div>
      </div>

      <div className="vertical-center margin-right">
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
      <div className="vertical-center">
        {blocked ? (
          <button className="button" onClick={() => handleBlockUnblock(false)}>
            Unblock User
          </button>
        ) : (
          <button className="button" onClick={() => handleBlockUnblock(true)}>
            Block User
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

export default User;
