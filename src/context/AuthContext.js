import {
  createContext,
  useReducer,
  useEffect,
  useContext,
  useRef,
} from "react";
import { io } from "socket.io-client";
import AuthReducer from "./AuthReducer";
import profilePicture from "../helper_functions/profilePicture";
import useAxiosConfig from "../api/useAxiosConfig";
import { getNotifications } from "../apiCalls";

const INITIAL_STATE = {
  user: JSON.parse(sessionStorage.getItem("user")) || null,
  isFetching: false,
  error: null,
  onlineFriends: new Map(),
  socket: null,
  notifications: {
    messages: JSON.parse(sessionStorage.getItem("messages")) || [],
    follows: [],
    variousNotifications: [],
  },
  viewingConversation: false,
};

const AuthContext = createContext(INITIAL_STATE);

function useAuth() {
  return useContext(AuthContext);
}

function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  const socket = useRef(null);
  const profile_picture = profilePicture(state.user);
  const api = useAxiosConfig(state.user, dispatch, socket);

  useEffect(() => {
    sessionStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  console.log({ onlineFriends: state.onlineFriends });

  useEffect(() => {
    if (state.user?._id) {
      socket.current = io(process.env.REACT_APP_SOCKET_URL, {
        query: { userId: state.user._id },
      });

      dispatch({ type: "SET_SOCKET", payload: socket.current });

      console.log("emitting the getuserId");
      socket.current.emit("getUserId", state.user._id);

      socket.current.on("getUsers", (friends) => {
        console.log({ friends });
        if (Array.isArray(friends)) {
          const mapFriends = new Map(
            friends.map((item, i) => {
              return [item, i];
            })
          );

          console.log(mapFriends);
          dispatch({ type: "UPDATE_ONLINE_FRIENDS", payload: mapFriends });
        }
      });

      socket.current.on("getUser", (userId) => {
        console.log({ receiveId: userId });
        dispatch({ type: "ADD_ONLINE_FRIEND", payload: userId });
      });

      socket.current.on("removeUser", (userId) => {
        console.log({ removeId: userId });
        dispatch({ type: "REMOVE_ONLINE_FRIEND", payload: userId });
      });

      socket.current.on("getMessageNotification", (message) => {
        if (state.viewingConversation === message.conversationId) {
          return;
        }

        const messages = JSON.parse(sessionStorage.getItem("messages"));

        if (messages) {
          sessionStorage.setItem(
            "messages",
            JSON.stringify([...messages, message])
          );
        } else {
          sessionStorage.setItem("messages", JSON.stringify([message]));
        }

        dispatch({ type: "SET_MESSAGE_NOTIFICATION", payload: message });
      });

      socket.current.on("getFollowNotification", (followObject) => {
        console.log({ receivedFollowObject: followObject });
        dispatch({ type: "SET_FOLLOW_NOTIFICATION", payload: followObject });
      });
    }
  }, [state.user?._id, state.viewingConversation, api]);

  useEffect(() => {
    const getNotificationObject = async () => {
      const notifications = await getNotifications(api, state.user._id);
      if (notifications) {
        dispatch({ type: "SET_NOTIFICATIONS", payload: notifications });
      }
    };

    state.user && getNotificationObject();
  }, [api, state.user]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        profile_picture,
        onlineFriends: state.onlineFriends,
        dispatch,
        socket: state.socket,
        notifications: state.notifications,
        viewingConversation: state.viewingConversation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthContextProvider, useAuth };
