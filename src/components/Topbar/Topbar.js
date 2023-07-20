import { useRef, useState, useEffect } from "react";

import "./Topbar.scss";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { handleLogout } from "../../apiCalls";
import useMediaQuery from "@mui/material/useMediaQuery";
import Hamburger from "hamburger-react";
import LeftBar from "../Leftbar/Leftbar";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { CircularProgress } from "@mui/material";
import { useQueries, useQuery } from "@tanstack/react-query";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { getUser } from "../../apiCalls";
import decryptMessage from "../../helper_functions/decryptMessage";
import { searchUsers, removeNotification } from "../../apiCalls";
import CheckIcon from "@mui/icons-material/Check";
import removeMessageFromStorage from "../../helper_functions/removeMessageFromStorage";
import SearchBar from "./SearchBar";

function Topbar() {
  const { user, dispatch, profile_picture, socket, notifications } = useAuth();

  const navigate = useNavigate();
  const searchBar = useRef(null);
  const [searchResults, setResults] = useState([]);
  const matchesMediaQuery = useMediaQuery("(min-width: 830px)");
  const matches478 = useMediaQuery("(max-width: 478px)");

  const [viewMessage, setViewMessage] = useState(new Map());

  const [parent] = useAutoAnimate();

  const api = useAxiosConfig2();

  useEffect(() => {
    if (notifications.follows.length === 0) {
      document.getElementById("follow-icon").classList.remove("clicked");
    }

    if (notifications.messages.length === 0) {
      document.getElementById("chat-icon").classList.remove("clicked");
    }

    if (notifications.variousNotifications.length === 0) {
      document.getElementById("various-icon").classList.remove("clicked");
    }
  });

  // useEffect(() => {
  //   const logout = document.querySelector(".logout");

  //   const handler = () => {
  //     socket?.emit("manualDisconnect");
  //     logoutCall(dispatch);
  //     navigate("/login", { replace: true });
  //   };

  //   logout.addEventListener("click", handler);

  //   return () => {
  //     window.removeEventListener("click", handler);
  //   };
  // }, []);

  // useEffect(() => {
  //   const handler = (e) => {
  //     if (!e.target.matches(".avatar-wrapper")) {
  //       let dropDown = document.querySelector(".drop-down");
  //       if (dropDown.classList.contains("show")) {
  //         dropDown.classList.remove("show");
  //       }
  //     }
  //   };

  //   window.addEventListener("click", handler);

  //   return () => {
  //     window.removeEventListener("click", handler);
  //   };
  // }, []);

  // useEffect(() => {
  //   let avatarWrapper = document.querySelector(".avatar-wrapper");

  //   const handler = (e) => {
  //     const dropDown = document.querySelector(".drop-down");

  //     if (e.target.classList.contains("avatar-arrow-down")) {
  //       dropDown.classList.toggle("show");
  //     }

  //     //e.stopPropagation();
  //   };

  //   avatarWrapper.addEventListener("click", handler);

  //   return () => {
  //     avatarWrapper.removeEventListener("click", handler);
  //   };
  // }, []);

  async function handleSearch() {
    const name = searchBar.current.value;

    let dropDown = document.querySelector(".search-drop-down");

    if (!dropDown.classList.contains("show")) {
      dropDown.classList.add("show");
    }

    if (name === "") dropDown.classList.remove("show");

    const res = await searchUsers(api, name);

    if (res.length === 0) {
      setResults([]);
    } else {
      setResults(res);
    }
  }

  function handleSearchResults() {
    const searchValue = searchBar.current.value;
    searchBar.current.value = "";
    document.querySelector(".search-drop-down").classList.remove("show");
    navigate("/search-results", { state: searchValue });
  }

  function navigateToSearchResults() {
    navigate("/search-results", { state: "" });
  }

  function navigateToSearchProfile(user) {
    searchBar.current.value = "";
    document.querySelector(".search-drop-down").classList.remove("show");
    navigate("/search-profile", { state: user });
  }

  function navigateToPost(postId) {
    navigate("/post", { state: postId });
  }

  function handleSideNav(toggled) {
    if (toggled) {
      document.querySelector(".side-nav").style.width = "150px";
      document.querySelector(".home-children-section").style.marginLeft =
        "150px";
    } else {
      document.querySelector(".side-nav").style.width = "0px";
      document.querySelector(".home-children-section").style.marginLeft = "0px";
    }
  }

  const notificationIds = {
    follow: ["follow-icon", "follow-drop-down"],
    message: ["chat-icon", "message-drop-down"],
    various: ["various-icon", "various-drop-down"],
    avatar: ["avatar-icon", "avatar-drop-down"],
  };

  function showSelectedNotifications(id) {
    for (let key in notificationIds) {
      if (key !== id) {
        document
          .getElementById(notificationIds[key][0])
          .classList.remove("clicked");
        document
          .getElementById(notificationIds[key][1])
          ?.classList.remove("show");
      }
    }

    document.getElementById(notificationIds[id][0]).classList.toggle("clicked");
    document.getElementById(notificationIds[id][1])?.classList.toggle("show");
  }

  async function handleMarkAsRead(id, type) {
    if (type === "message") {
      removeMessageFromStorage(id);
      await removeNotification(api, user._id, { messageId: id });
      dispatch({ type: "CLEAR_MESSAGE_NOTIFICATION", payload: id });
    } else if (type === "follow") {
      await removeNotification(api, user._id, { followId: id });
      dispatch({ type: "CLEAR_FOLLOW_NOTIFICATION", payload: id });
    } else if (type === "various") {
      await removeNotification(api, user._id, { variousId: id });
      dispatch({ type: "CLEAR_VARIOUS_NOTIFICATION", payload: id });
    }
  }

  function handleViewMessage(messageId) {
    if (viewMessage.has(messageId)) {
      setViewMessage((map) => {
        map.delete(messageId);
        return new Map(map);
      });
    } else {
      setViewMessage((map) => {
        map.set(messageId, "");
        return new Map(map);
      });
    }
  }

  return (
    <>
      <aside className="side-nav">
        <LeftBar />
      </aside>

      <nav className="topbar">
        <div className="topbar-grouping">
          {matchesMediaQuery ? (
            <div className="topbar-left">
              <div className="logo">
                <Link to="/" style={{ textDecoration: "none", color: "white" }}>
                  InContact
                </Link>
              </div>
            </div>
          ) : (
            <div className="hamburger">
              <Hamburger size={24} onToggle={handleSideNav} color="white" />
            </div>
          )}

          <div className="topbar-center">
            {matches478 ? (
              <SearchIcon
                className="search-icon"
                onClick={navigateToSearchResults}
              />
            ) : (
              <SearchBar searchBar={searchBar} handleSearch={handleSearch} />
            )}

            <div id="search-bar-drop-down" className="search-drop-down">
              <ul>
                {
                  <li>
                    {searchResults.length > 0 ? (
                      <span
                        onClick={handleSearchResults}
                        className="search-username"
                      >
                        View all results
                      </span>
                    ) : (
                      "No results"
                    )}
                  </li>
                }
                {searchResults.map((user) => {
                  return (
                    <li
                      key={user._id}
                      className="search-username"
                      onClick={() => navigateToSearchProfile(user)}
                    >
                      {user.username}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="topbar-right">
            {notifications?.follows.length > 0 && (
              <div className="search-drop-down" id="follow-drop-down">
                <ul>
                  {notifications.follows?.map(({ id, follower, message }) => {
                    return (
                      <li key={id}>
                        <section className="notification">
                          <div className="notification-sender">
                            {message}
                            <span
                              className="navigate-user"
                              onClick={() => navigateToSearchProfile(follower)}
                            >
                              {` ${follower.username}`}
                            </span>
                          </div>

                          <CheckIcon
                            className="cursor-icon"
                            onClick={() => handleMarkAsRead(id, "follow")}
                          />
                        </section>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {notifications?.messages.length > 0 && (
              <div className="search-drop-down" id="message-drop-down">
                <ul>
                  {notifications.messages?.map((message) => {
                    return (
                      <li key={message._id}>
                        <section className="notification">
                          <div className="notification-sender">
                            <span
                              className="navigate-user"
                              onClick={() =>
                                navigateToSearchProfile(message.senderUser)
                              }
                            >{`${message.senderUser.username}`}</span>
                            {" sent you a message"}
                          </div>

                          <ChatBubbleIcon
                            className="cursor-icon"
                            onClick={() => handleViewMessage(message._id)}
                          />

                          <MarkChatReadIcon
                            className="cursor-icon"
                            onClick={() =>
                              handleMarkAsRead(message._id, "message")
                            }
                          />
                        </section>

                        <div
                          ref={parent}
                          className="notification-message-wrapper"
                        >
                          {viewMessage.has(message._id) && (
                            <div className="notification-message">
                              {decryptMessage(message.message)}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {notifications.variousNotifications.length > 0 && (
              <div className="search-drop-down" id="various-drop-down">
                <ul>
                  {notifications.variousNotifications.map(
                    ({ id, message, liker, type, typeId }) => {
                      return (
                        <li key={id}>
                          <section className="notification">
                            <div>
                              <span
                                className="navigate-user"
                                onClick={() => navigateToSearchProfile(liker)}
                              >
                                {`${liker.username}`}
                              </span>
                              {` ${message}`}
                              <span
                                className="navigate-user"
                                onClick={() => navigateToPost(typeId)}
                              >{` ${type}`}</span>
                            </div>

                            <CheckIcon
                              className="cursor-icon"
                              onClick={() => handleMarkAsRead(id, "various")}
                            />
                          </section>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
            )}

            {/* matchesMediaQuery && */}
            {
              <div className="topbar-icons">
                <div
                  className="topbar-icon-item"
                  id="follow-icon"
                  onClick={() => showSelectedNotifications("follow")}
                >
                  <PersonIcon className="notification-icon" />
                  {notifications?.follows?.length > 0 && (
                    <span className="topbar-icon-badge">
                      {notifications.follows.length}
                    </span>
                  )}
                </div>

                <div
                  className="topbar-icon-item"
                  id="chat-icon"
                  onClick={() => showSelectedNotifications("message")}
                >
                  <ChatIcon className="notification-icon" />
                  {notifications?.messages?.length > 0 && (
                    <span className="topbar-icon-badge">
                      {notifications.messages.length}
                    </span>
                  )}
                </div>
                <div
                  className="topbar-icon-item"
                  id="various-icon"
                  onClick={() => showSelectedNotifications("various")}
                >
                  <NotificationsIcon className="notification-icon" />
                  {notifications?.variousNotifications?.length > 0 && (
                    <span className="topbar-icon-badge">
                      {notifications.variousNotifications.length}
                    </span>
                  )}
                </div>
              </div>
            }

            <div className="avatar-wrapper">
              <div
                id="avatar-icon"
                className="show-avatar"
                onClick={() => showSelectedNotifications("avatar")}
              >
                <img className="my-avatar" src={profile_picture} alt="" />
                <KeyboardArrowDownIcon className="avatar-arrow-down" />
              </div>
              <div id="avatar-drop-down" className="drop-down">
                <ul>
                  <li>
                    <SettingsIcon className="drop-down-icon" />
                    <span>Settings</span>
                  </li>
                  <li
                    className="logout"
                    onClick={() => handleLogout(socket, dispatch, navigate)}
                  >
                    <LogoutIcon className="drop-down-icon" />{" "}
                    <span>Logout</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Topbar;
