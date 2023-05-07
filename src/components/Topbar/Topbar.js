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
import { logoutCall } from "../../apiCalls";
import axios from "axios";
import useMediaQuery from "@mui/material/useMediaQuery";
import Hamburger from "hamburger-react";
import LeftBar from "../Leftbar/Leftbar";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import { CircularProgress } from "@mui/material";
import { useQueries, useQuery } from "@tanstack/react-query";
import useAxiosConfig from "../../api/useAxiosConfig";
import { getUser } from "../../apiCalls";

function Topbar() {
  const {
    user: { _id: userId },
    dispatch,
    profile_picture,
    socket,
    messageNotifications,
  } = useAuth();
  const navigate = useNavigate();
  const searchBar = useRef(null);
  const [searchResults, setResults] = useState([]);
  const matchesMediaQuery = useMediaQuery("(min-width: 830px)");

  const [friendNotification, setFriendNotification] = useState([]);
  const [notification, setNotification] = useState([]);

  const [viewMessage, setViewMessage] = useState(new Map());

  const [parent] = useAutoAnimate();

  console.log({ messageNotifications });

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

  function handleLogout() {
    socket?.emit("manualDisconnect");
    logoutCall(dispatch);
    navigate("/login", { replace: true });
  }

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

    try {
      const res = await axios.post("/users/search", { name });
      if (res.data.length === 0) {
        setResults([]);
      } else {
        setResults(res.data);
      }
    } catch (error) {
      console.log(error);
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

  function handleMessageNotifications() {
    document.getElementById("message-drop-down")?.classList.toggle("show");
    document.getElementById("chat-icon").classList.toggle("clicked");
  }

  function handleMarkAsRead(messageId) {
    dispatch({ type: "CLEAR_MESSAGE_NOTIFICATION", payload: messageId });
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
              <div className="search-drop-down">
                <ul>
                  {
                    <li>
                      {searchResults.length > 0 ? (
                        <span onClick={handleSearchResults}>
                          View all results
                        </span>
                      ) : (
                        "No results"
                      )}
                    </li>
                  }
                  {searchResults.map((res, i) => {
                    // return <li key={i}>{res.full_name}</li>;
                    return <li key={i}>{res.username}</li>;
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            {messageNotifications.length > 0 && (
              <div className="search-drop-down" id="message-drop-down">
                <ul>
                  {messageNotifications?.map((obj) => {
                    return (
                      <li key={obj.message._id}>
                        <section className="notification">
                          <span>{`${obj.senderName} sent you a message`}</span>

                          <ChatBubbleIcon
                            onClick={() => handleViewMessage(obj.message._id)}
                          />

                          <MarkChatReadIcon
                            onClick={() => handleMarkAsRead(obj.message._id)}
                          />
                        </section>

                        <div ref={parent}>
                          {viewMessage.has(obj.message._id) && (
                            <div className="notification-message">
                              {obj.message.message}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* <div className="search-drop-down" id="message-drop-down">
              <ul ref={parent}>
                {messageNotifications?.map((obj) => {
                  return (
                    <li key={obj.message._id}>
                      <section className="notification">
                        <span>{`${obj.senderName} sent you a message`}</span>

                        <ChatBubbleIcon
                          onClick={() => handleViewMessage(obj.message._id)}
                        />

                        <MarkChatReadIcon
                          onClick={() => handleMarkAsRead(obj.message._id)}
                        />
                      </section>

                      <div ref={parent}>
                        {viewMessage.has(obj.message._id) && (
                          <div className="notification-message">
                            {obj.message.message}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div> */}

            {/* matchesMediaQuery && */}
            {
              <div className="topbar-icons">
                <div className="topbar-icon-item">
                  <PersonIcon />
                  {friendNotification?.length > 0 && (
                    <span className="topbar-icon-badge">
                      {friendNotification.length}
                    </span>
                  )}
                </div>

                <div
                  className="topbar-icon-item"
                  id="chat-icon"
                  onClick={handleMessageNotifications}
                >
                  <ChatIcon />
                  {messageNotifications?.length > 0 && (
                    <span className="topbar-icon-badge">
                      {messageNotifications.length}
                    </span>
                  )}
                </div>
                <div className="topbar-icon-item">
                  <NotificationsIcon />
                  {notification?.length > 0 && (
                    <span className="topbar-icon-badge">
                      {notification.length}
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
                  <li className="logout" onClick={handleLogout}>
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
