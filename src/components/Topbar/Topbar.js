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

function Topbar() {
  const { user, dispatch, profile_picture, socket, notifications } = useAuth();

  const navigate = useNavigate();
  const searchBar = useRef(null);
  const [searchResults, setResults] = useState([]);
  const matchesMediaQuery = useMediaQuery("(min-width: 830px)");

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

  function handleShow(e) {
    document.querySelector(".drop-down").classList.toggle("show");
    // if (e.target.classList.contains("avatar-arrow-down")) {

    // }
  }

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
    let dropDown = document.querySelector(".search-drop-down");
    dropDown.classList.remove("show");
    navigate("/search-results", { state: searchValue });
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
    //various: ["various-icon", "various-drop-down"], this property is for the future feature
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
            <Hamburger size={24} onToggle={handleSideNav} color="white" />
          )}

          <div className="topbar-center">
            <div className="search-bar">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder="Search for friend"
                ref={searchBar}
                onChange={handleSearch}
              />
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
                  {searchResults.map((res, i) => {
                    // return <li key={i}>{res.full_name}</li>;
                    return (
                      <li key={i} className="search-username">
                        {res.username}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            {notifications?.follows.length > 0 && (
              <div className="search-drop-down" id="follow-drop-down">
                <ul>
                  {notifications.follows?.map(({ id, follower }) => {
                    return (
                      <li key={id}>
                        <section className="notification">
                          <span className="notification-sender">
                            {`You have been followed by ${follower.first_name} ${follower.last_name}`}
                          </span>

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
                          <span className="notification-sender">{`${message.senderName} sent you a message`}</span>

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
            {/* matchesMediaQuery && */}
            {
              <div className="topbar-icons">
                <div
                  className="topbar-icon-item"
                  id="follow-icon"
                  onClick={() => showSelectedNotifications("follow")}
                >
                  <PersonIcon />
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
                  <ChatIcon />
                  {notifications?.messages?.length > 0 && (
                    <span className="topbar-icon-badge">
                      {notifications.messages.length}
                    </span>
                  )}
                </div>
                <div className="topbar-icon-item">
                  <NotificationsIcon />
                  {notifications?.variousNotifications?.length > 0 && (
                    <span className="topbar-icon-badge">
                      {notifications.variousNotifications.length}
                    </span>
                  )}
                </div>
              </div>
            }

            <div className="avatar-wrapper">
              <div className="show-avatar" onClick={handleShow}>
                <img className="my-avatar" src={profile_picture} alt="" />
                <KeyboardArrowDownIcon className="avatar-arrow-down" />
              </div>
              <div className="drop-down">
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
