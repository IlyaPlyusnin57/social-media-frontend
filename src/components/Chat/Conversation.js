import "./Conversation.scss";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import Message from "./Message";
import { useState, useEffect, useRef } from "react";
import profilePicture from "../../helper_functions/profilePicture";
import {
  getConversation,
  getMessages,
  sendMessagetoUser,
} from "../../apiCalls";
import useAxiosConfig from "../../api/useAxiosConfig";
import OnlineUser from "../Online User/OnlineUser";
import { CircularProgress } from "@mui/material";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown";
import { useWatchRef } from "../../hooks/useWatchRef";
import SendIcon from "@mui/icons-material/Send";
import { useGetLastRef } from "../../hooks/useGetLastRef";
import { getMonthAndDay } from "../../helper_functions/monthAndDay";
import decryptMessage from "../../helper_functions/decryptMessage";

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

  const monthArray = useRef([]);

  // console.log({ unseenMessages });

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

  useEffect(() => {
    handleIntersection();
  }, [messages]);

  const { data: conversation } = useQuery({
    queryFn: () => getConversation(api, userId, friend._id),
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

  async function sendMessage(e) {
    if (input.current.value.length === 0) return;
    if (e.key !== "Enter" && e.type !== "click") return;

    const res = await sendMessagetoUser(
      api,
      userId,
      input.current.value,
      conversation._id
    );

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

  const lastPostRef = useGetLastRef(
    isFetching,
    hasNextPage,
    nextPostId,
    setLastPostId
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

  function handleIntersection() {
    const currentMonthContainer = document.querySelector(
      ".current-conversation-month"
    );

    const { top: currMonthTop } = currentMonthContainer.getBoundingClientRect();

    monthArray.current.forEach((month) => {
      const domElements = document.querySelectorAll(
        `.message-container[data-time='${month}']`
      );

      let top = 0;
      let bottom = 0;

      domElements.forEach((element, i, elementsArray) => {
        if (i === 0) {
          bottom = element.getBoundingClientRect().bottom;
          bottom += 25;
        }

        if (i === elementsArray.length - 1) {
          top = element.getBoundingClientRect().top;

          if (top > currMonthTop || bottom > currMonthTop) {
            currentMonthContainer.innerHTML = month;
          }
        }
      });
    });
  }

  monthArray.current.length = 0;

  const messageContent = messages.map((message, index, messageArray) => {
    const decryptedMessage = decryptMessage(message.message);

    const currDate = getMonthAndDay(message.createdAt);
    let separate = false;

    const len = monthArray.current.length;
    const lastDate = monthArray.current[len - 1];

    if (len === 0 || currDate !== lastDate) {
      monthArray.current.push(currDate);
    }

    const nextMonth =
      index + 1 < messageArray.length
        ? getMonthAndDay(messageArray[index + 1].createdAt)
        : currDate;

    if (currDate !== nextMonth || index === messageArray.length - 1) {
      separate = true;
    }

    if (message?.arrived) {
      message["arrived"] = false;

      return (
        <Message
          separate={separate}
          ref={arrivedRef}
          key={message._id}
          message={decryptedMessage}
          own={userId === message.senderId}
          time={message.createdAt}
        />
      );
    }

    return (
      <Message
        separate={separate}
        ref={index === messages.length - 1 ? lastPostRef : null}
        key={message._id}
        message={decryptedMessage}
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

      <div className="current-conversation-month"></div>
      <div className="conversation-image-container">
        <OnlineUser
          profilePicture={profile_picture}
          userId={friend?._id}
          backgroundColor="#4a4a4a"
        />
        <h4 className="margin-left">{friend?.username}</h4>
      </div>
      <div className="conversation" onScroll={handleIntersection}>
        {messageContent}

        {isFetching && <div className="spinner">{<CircularProgress />}</div>}
      </div>
      <div className="message-input-container">
        <input
          onKeyDown={sendMessage}
          ref={input}
          className="message-input"
          type="text"
          placeholder="Send a message"
        />
        <SendIcon onClick={sendMessage} className="send-icon" />
      </div>
    </div>
  );
}

export default Conversation;
