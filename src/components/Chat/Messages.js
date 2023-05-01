import Message from "./Message";
import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import useAxiosConfig from "../../api/useAxiosConfig";
import { getMessages } from "../../apiCalls";
import { getConversation } from "../../apiCalls";
import axios from "axios";

const Messages = memo(function Messages() {
  const {
    user: { _id: userId },
    socket,
  } = useAuth();

  const input = useRef(null); // ref for the input
  const [messages, setMessages] = useState([]);
  const { state: friend } = useLocation();
  const [arrivalMsg, setArrivalMsg] = useState(null);
  // const [parent] = useAutoAnimate();
  const api = useAxiosConfig();

  const [hasNextPage, setNextPage] = useState(false);
  const nextPostId = useRef(null);
  const [lastPostId, setLastPostId] = useState(null);

  //   const [messageContent, setMessageContent] = useState([
  //     <Message key={1} message="Message 1" />,
  //   ]);

  console.log({ messages });

  useEffect(() => {
    socket?.on("getMessage", ({ senderId, message }) => {
      console.log("got the message!");
      setArrivalMsg({
        senderId,
        message,
      });
    });
  }, [socket]);

  useEffect(() => {
    if (arrivalMsg && arrivalMsg.senderId === friend._id) {
      setMessages((prev) => [...prev, arrivalMsg]);
    }
  }, [arrivalMsg, friend._id]);

  const { data: conversation } = useQuery({
    queryFn: () => getConversation(api, userId, friend),
    queryKey: ["get-conversation", userId, friend._id],
    refetchOnWindowFocus: false,
  });

  function handleInput(e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  async function sendMessage() {
    const res = await axios.post("/messages", {
      senderId: userId,
      message: input.current.value,
      conversationId: conversation._id,
    });

    if (res.statusText === "OK") {
      socket?.emit("sendMessage", {
        senderId: userId,
        receiverId: friend._id,
        message: input.current.value,
      });

      input.current.value = "";
      setMessages([res.data, ...messages]);
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

  //   const messageContent = useMemo(() => {
  //     return messages.map((message, i) => {
  //       if (i === messages.length - 1) {
  //         return (
  //           <Message
  //             ref={lastPostRef}
  //             key={message._id}
  //             message={message.message}
  //             own={userId === message.senderId}
  //           />
  //         );
  //       }

  //       return (
  //         <Message
  //           key={message._id}
  //           message={message.message}
  //           own={userId === message.senderId}
  //         />
  //       );
  //     });
  //   }, [messages, userId, lastPostRef]);

  //   if (status === "loading") {
  //     return <span>Loading...</span>;
  //   }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  const messageContent = messages.map((message, i) => {
    if (i === messages.length - 1) {
      return (
        <Message
          ref={lastPostRef}
          key={message._id}
          message={message.message}
          own={userId === message.senderId}
        />
      );
    }

    return (
      <Message
        key={message._id}
        message={message.message}
        own={userId === message.senderId}
      />
    );
  });

  //   function handleAddNewMessage() {
  //     console.log("Added new message!");
  //     const nextNum = messageContent.length + 1;
  //     setMessageContent((prev) => [
  //       ...prev,
  //       <Message key={nextNum} message={`Message ${nextNum}`} />,
  //     ]);
  //   }

  return (
    <>
      <div className="conversation">
        {messageContent}
        {status === "loading" && <p>Loading more messages</p>}
      </div>
    </>
  );
});

// function Messages() {
//   const {
//     user: { _id: userId },
//     socket,
//   } = useAuth();

//   const input = useRef(null); // ref for the input
//   const [messages, setMessages] = useState([]);
//   const { state: friend } = useLocation();
//   const [arrivalMsg, setArrivalMsg] = useState(null);
//   const [parent] = useAutoAnimate();
//   const api = useAxiosConfig();

//   const [hasNextPage, setNextPage] = useState(false);
//   const nextPostId = useRef(null);
//   const [lastPostId, setLastPostId] = useState(null);

//   //   const [messageContent, setMessageContent] = useState([
//   //     <Message key={1} message="Message 1" />,
//   //   ]);

//   console.log({ messages });

//   useEffect(() => {
//     socket?.on("getMessage", ({ senderId, message }) => {
//       console.log("got the message!");
//       setArrivalMsg({
//         senderId,
//         message,
//       });
//     });
//   }, [socket]);

//   useEffect(() => {
//     if (arrivalMsg && arrivalMsg.senderId === friend._id) {
//       setMessages((prev) => [...prev, arrivalMsg]);
//     }
//   }, [arrivalMsg, friend._id]);

//   const { data: conversation } = useQuery({
//     queryFn: () => getConversation(api, userId, friend),
//     queryKey: ["get-conversation", userId, friend._id],
//     refetchOnWindowFocus: false,
//   });

//   function handleInput(e) {
//     if (e.key === "Enter") {
//       sendMessage();
//     }
//   }

//   async function sendMessage() {
//     const res = await axios.post("/messages", {
//       senderId: userId,
//       message: input.current.value,
//       conversationId: conversation._id,
//     });

//     if (res.statusText === "OK") {
//       socket?.emit("sendMessage", {
//         senderId: userId,
//         receiverId: friend._id,
//         message: input.current.value,
//       });

//       input.current.value = "";
//       setMessages([res.data, ...messages]);
//     }
//   }

//   const { status, error, isFetching } = useQuery({
//     queryKey: ["convo", friend._id, lastPostId],
//     queryFn: () => getMessages(api, conversation, { lastPostId }),
//     enabled: !!conversation,
//     refetchOnWindowFocus: false,
//     onSuccess: (data) => {
//       setMessages((prev) => [...prev, ...data]);
//       setNextPage(data.length === 10);
//       nextPostId.current =
//         data.length === 10 ? data[data.length - 1]._id : null;
//     },
//   });

//   const intObserver = useRef(null);

//   const lastPostRef = useCallback(
//     (message) => {
//       if (isFetching) return;

//       if (intObserver.current) intObserver.current.disconnect();

//       intObserver.current = new IntersectionObserver((message) => {
//         if (message[0].isIntersecting && hasNextPage) {
//           if (nextPostId.current) setLastPostId(nextPostId.current);
//           console.log("Intersecting at the top");
//         }
//       });

//       if (message) intObserver.current.observe(message);
//     },
//     [isFetching, hasNextPage]
//   );

//   //   const messageContent = useMemo(() => {
//   //     return messages.map((message, i) => {
//   //       if (i === messages.length - 1) {
//   //         return (
//   //           <Message
//   //             ref={lastPostRef}
//   //             key={message._id}
//   //             message={message.message}
//   //             own={userId === message.senderId}
//   //           />
//   //         );
//   //       }

//   //       return (
//   //         <Message
//   //           key={message._id}
//   //           message={message.message}
//   //           own={userId === message.senderId}
//   //         />
//   //       );
//   //     });
//   //   }, [messages, userId, lastPostRef]);

//   if (status === "loading") {
//     return <span>Loading...</span>;
//   }

//   if (status === "error") {
//     return <span>Error: {error.message}</span>;
//   }

//   const messageContent = messages.map((message, i) => {
//     if (i === messages.length - 1) {
//       return (
//         <Message
//           ref={lastPostRef}
//           key={message._id}
//           message={message.message}
//           own={userId === message.senderId}
//         />
//       );
//     }

//     return (
//       <Message
//         key={message._id}
//         message={message.message}
//         own={userId === message.senderId}
//       />
//     );
//   });

//   //   function handleAddNewMessage() {
//   //     console.log("Added new message!");
//   //     const nextNum = messageContent.length + 1;
//   //     setMessageContent((prev) => [
//   //       ...prev,
//   //       <Message key={nextNum} message={`Message ${nextNum}`} />,
//   //     ]);
//   //   }

//   return (
//     <>
//       <div className="conversation" ref={parent}>
//         {messageContent}
//       </div>
//     </>
//   );
// }

export default Messages;
