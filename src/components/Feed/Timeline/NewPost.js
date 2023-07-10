import "./NewPost.scss";

import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../../../context/AuthContext";
import { useRef, useState } from "react";
import useAxiosConfig2 from "../../../api/useAxiosConfig2";
import { getSubs } from "../../../apiCalls";
import { useQuery } from "@tanstack/react-query";

function NewPost({ setPosts }) {
  const { user, profile_picture, socket } = useAuth();
  const post_content = useRef(null);
  const api = useAxiosConfig2();
  const [subs, setSubs] = useState([]);
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState([]);

  useQuery({
    queryFn: () => getSubs(api, user),
    queryKey: [user._id],
    enabled: queryEnabled,
    refetchOnWindowFocus: false,
    onSuccess: (users) => {
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
    const lastChar = document.querySelector(".input-send").value.at(-1);

    if (lastChar && lastChar === "@") {
      setQueryEnabled(true);
      document.querySelector(".tag-drop-down").classList.add("show");
    } else {
      document.querySelector(".tag-drop-down").classList.remove("show");
    }
  }

  function tagUser(user) {
    const username = `${user.first_name} ${user.last_name}`;
    document.querySelector(".input-send").value += username;
    setTaggedUsers((prev) => [...prev, user]);
    // const sectionInput = document.querySelector("#new-post-input");
    // sectionInput.innerHTML += `<span id="tagged-user">${user.first_name} ${user.last_name}</span>`;
    document.querySelector(".tag-drop-down").classList.remove("show");
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

        <div className="tag-drop-down">
          <ul>
            {subs.map((user) => {
              return (
                <li
                  key={user._id}
                  onClick={() => tagUser(user)}
                >{`${user.first_name} ${user.last_name}`}</li>
              );
            })}
          </ul>
        </div>
      </section>
      <SendIcon className="new-post-send-icon" onClick={handleSendIconClick} />
    </div>
  );
}

export default NewPost;
