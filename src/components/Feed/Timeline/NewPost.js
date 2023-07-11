import "./NewPost.scss";

import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../../../context/AuthContext";
import { useRef, useState } from "react";
import useAxiosConfig2 from "../../../api/useAxiosConfig2";
import { getSubs } from "../../../apiCalls";
import { useQuery } from "@tanstack/react-query";
import ClearIcon from "@mui/icons-material/Clear";

function NewPost({ setPosts }) {
  const { user, profile_picture, socket } = useAuth();
  const post_content = useRef(null);
  const api = useAxiosConfig2();
  const [subs, setSubs] = useState([]);
  const allSubs = useRef([]);
  const isSearchOn = useRef(true);
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);

  useQuery({
    queryFn: () => getSubs(api, user),
    queryKey: [user._id],
    enabled: queryEnabled,
    refetchOnWindowFocus: false,
    onSuccess: (users) => {
      allSubs.current = users;
      setSubs(users);
    },
  });

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendIconClick();
    }
  }

  async function handleSendIconClick() {
    const postObject = {
      userId: user._id,
      desc: post_content.current.value + ` from ${user.username}`,
    };

    try {
      const res = await api.post("posts/", {
        postObject,
        taggedUsers,
        sendUser: user,
      });

      if (res.status === 200) {
        setTaggedUsers([]);
        const { newPost, tagObjects } = res.data;

        setPosts((prev) => [newPost, ...prev]);
        let sendIcon = document.querySelector(".input-send");
        sendIcon.value = "";
        socket?.emit("sendTags", tagObjects);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function handleInput() {
    const value = document.querySelector(".input-send").value;

    // check if the input has all of the tagged usernames
    taggedUsers.forEach((user) => {
      if (!value.includes(user.username)) {
        setTaggedUsers((prev) =>
          prev.filter((taggedUser) => {
            return taggedUser._id !== user._id;
          })
        );
      }
    });

    const lastChar = value.at(-1);

    if ((lastChar && lastChar === " ") || !value.includes("@")) {
      isSearchOn.current = false;
      setSubs([]);
    } else {
      isSearchOn.current = true;
      setQueryEnabled(true);
    }

    if (isSearchOn.current) {
      let index = value.lastIndexOf("@");
      const query = value.substring(++index);
      const arr = allSubs.current.filter((user) => {
        return user.username.match(query);
      });

      setSubs(arr);
    }
  }

  function removeTaggedUserFromInput(username) {
    const value = document
      .querySelector(".input-send")
      .value.replace(`@${username}`, "");

    document.querySelector(".input-send").value = value;
    setTaggedUsers((prev) =>
      prev.filter((user) => {
        return user.username !== username;
      })
    );
  }

  function tagUser(user) {
    const value = document.querySelector(".input-send").value;
    let index = value.lastIndexOf("@");
    document.querySelector(".input-send").value = value.substring(0, ++index);
    document.querySelector(".input-send").value += `${user.username}`;
    setTaggedUsers((prev) => [...prev, user]);
    setSubs([]);
  }

  return (
    <div className="new-post">
      <img src={profile_picture} alt="" />
      <section id="new-post-input">
        <input
          type="text"
          placeholder="What's on your mind"
          ref={post_content}
          className="input-send"
          onKeyDown={handleKeyPress}
          onInput={handleInput}
        />

        {subs.length > 0 && (
          <div className="tag-drop-down">
            <ul>
              {subs.map((user) => {
                return (
                  <li
                    key={user._id}
                    onClick={() => tagUser(user)}
                  >{`${user.first_name} ${user.last_name} (@${user.username})`}</li>
                );
              })}
            </ul>
          </div>
        )}

        <section id="tagged-users">
          {Array.isArray(taggedUsers) &&
            taggedUsers.length > 0 &&
            taggedUsers.map((user) => {
              return (
                <span key={user._id} id="tagged-user">
                  {user.username}
                  <ClearIcon
                    id="clear-icon"
                    onClick={() => removeTaggedUserFromInput(user.username)}
                  />
                </span>
              );
            })}
        </section>
      </section>
      <SendIcon className="new-post-send-icon" onClick={handleSendIconClick} />
    </div>
  );
}

export default NewPost;
