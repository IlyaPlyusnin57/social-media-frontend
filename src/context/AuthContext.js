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

const INITIAL_STATE = {
  user: JSON.parse(sessionStorage.getItem("user")) || null,
  isFetching: false,
  error: null,
  onlineFriends: new Map(),
  socket: null,
  messageNotifications: [],
  messageDropDown: [],
  viewingMessages: false,
};

const AuthContext = createContext(INITIAL_STATE);

function useAuth() {
  return useContext(AuthContext);
}

function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  const socket = useRef(null);
  const profile_picture = profilePicture(state.user);

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
        dispatch({ type: "SET_MESSAGE_NOTIFICATION", payload: message });
      });
    }
  }, [state.user?._id]);

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
        messageNotifications: state.messageNotifications,
        viewingMessages: state.viewingMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthContextProvider, useAuth };
