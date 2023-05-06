import "./Conversation.scss";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Message from "./Message";
import { useState, useEffect, useCallback, useRef } from "react";
import profilePicture from "../../helper_functions/profilePicture";
import { getConversation, getMessages } from "../../apiCalls";
import useAxiosConfig from "../../api/useAxiosConfig";
import OnlineUser from "../Online User/OnlineUser";
import { CircularProgress } from "@mui/material";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown";
import { useWatchRef } from "../../hooks/useWatchRef";

function Conversation() {
  const {
    user: { _id: userId },
    socket,
    dispatch,
  } = useAuth();

  const input = useRef(null); // ref for the input
  const [messages, setMessages] = useState([]);
  const { state: friend } = useLocation();
  const [arrivalMsg, setArrivalMsg] = useState(null);
  const api = useAxiosConfig();

  const [hasNextPage, setNextPage] = useState(false);
  const nextPostId = useRef(null);
  const [lastPostId, setLastPostId] = useState(null);
  const [messageSent, setMessageSent] = useState(false);

  const [unseenMessages, setUnseenMessages] = useState(0);
  const arrivedRef = useWatchRef(setUnseenMessages);

  console.log({ unseenMessages });

  useEffect(() => {
    socket?.on("getMessage", (message) => {
      console.log("got the message!");
      message.arrived = true;
      setArrivalMsg(message);
    });
  }, [socket]);

  useEffect(() => {
    if (arrivalMsg && arrivalMsg.senderId === friend._id) {
      setMessages((prev) => [arrivalMsg, ...prev]);
      //dispatch({ type: "CLEAR_MESSAGE_NOTIFICATION" });
    }
  }, [arrivalMsg, friend._id, dispatch]);

  // useEffect(() => {
  //   socket.current.emit("getUserId", userId);
  //   socket.current.on("getUsers", (users) => {
  //     //console.log(users);
  //   });
  // }, [userId]);

  useEffect(() => {
    scrollBottom();
  }, [messageSent]);

  const { data: conversation } = useQuery({
    queryFn: () => getConversation(api, userId, friend),
    queryKey: ["get-conversation", userId, friend._id],
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (conversation?._id) {
      dispatch({
        type: "CLEAR_MESSAGE_NOTIFICATION_FOR_CONVERSATION",
        payload: conversation._id,
      });
      dispatch({
        type: "SET_VIEWING_CONVERSATION",
        payload: conversation._id,
      });
    }

    return () => {
      dispatch({ type: "SET_VIEWING_CONVERSATION", payload: false });
    };
  }, [dispatch, conversation]);

  function handleInput(e) {
    console.log({ eventIs: e });
    console.log({ inputIs: input.current.value });
    if (e.key === "Enter" && input.current.value.length > 0) {
      console.log("about to send the message");
      sendMessage();
    }
  }

  async function sendMessage() {
    const res = await axios.post("/messages", {
      senderId: userId,
      message: input.current.value,
      conversationId: conversation._id,
    });

    console.log({ resIs: res });

    if (res.status === 200) {
      socket?.emit("sendMessage", friend._id, res.data);
      console.log("message was just sent");
      input.current.value = "";
      setMessages([res.data, ...messages]);
      setMessageSent((prev) => !prev);
    }
  }

  const { status, error, isFetching } = useQuery({
    queryKey: ["convo", friend._id, lastPostId],
    queryFn: () => getMessages(api, conversation, { lastPostId }),
    enabled: !!conversation,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, ...data]);
      setNextPage(data.length === 10);
      nextPostId.current =
        data.length === 10 ? data[data.length - 1]._id : null;
    },
  });

  const intObserver = useRef(null);

  const lastPostRef = useCallback(
    (message) => {
      if (isFetching) return;

      if (intObserver.current) intObserver.current.disconnect();

      intObserver.current = new IntersectionObserver((message) => {
        if (message[0].isIntersecting && hasNextPage) {
          if (nextPostId.current) setLastPostId(nextPostId.current);
          console.log("Intersecting at the top");
        }
      });

      if (message) intObserver.current.observe(message);
    },
    [isFetching, hasNextPage]
  );

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  function scrollBottom() {
    let conv = document.querySelector(".conversation");
    if (conv !== null) {
      conv.scroll({ top: conv.scrollHeight, left: 0, behavior: "smooth" });
      //conv.scroll(0, conv.scrollHeight);
    }
  }

  const messageContent = messages.map((message, i) => {
    if (message?.arrived) {
      message["arrived"] = false;

      return (
        <Message
          ref={arrivedRef}
          key={message._id}
          message={message.message}
          own={userId === message.senderId}
          time={message.createdAt}
        />
      );
    }

    if (i === messages.length - 1) {
      return (
        <Message
          ref={lastPostRef}
          key={message._id}
          message={message.message}
          own={userId === message.senderId}
          time={message.createdAt}
        />
      );
    }

    return (
      <Message
        key={message._id}
        message={message.message}
        own={userId === message.senderId}
        time={message.createdAt}
      />
    );
  });

  const profile_picture = profilePicture(friend);

  return (
    <div className="conversation-container">
      {unseenMessages > 0 && (
        <div className="circle-down-icon-wrapper" onClick={scrollBottom}>
          <ExpandCircleDownIcon className="circle-down-icon" />
          <div className="unseen-messages">{unseenMessages}</div>
        </div>
      )}
      <div className="conversation-image-container">
        <OnlineUser
          profilePicture={profile_picture}
          userId={friend?._id}
          backgroundColor="#4a4a4a"
        />
        <h4 className="margin-left">{friend?.username}</h4>
      </div>
      <div className="conversation">
        {messageContent}
        {isFetching && <div className="spinner">{<CircularProgress />}</div>}
      </div>
      <div className="message-input-container">
        <input
          onKeyDown={handleInput}
          ref={input}
          className="message-input"
          type="text"
          placeholder="Send a message"
        />
      </div>
    </div>
  );
}

export default Conversation;
