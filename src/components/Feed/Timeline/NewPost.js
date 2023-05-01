import "./NewPost.scss";

import SendIcon from "@mui/icons-material/Send";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";
import { useRef } from "react";

function NewPost({ setPosts }) {
  const { user, profile_picture } = useAuth();
  const post_content = useRef(null);

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendIconClick();
    }
  }

  async function handleSendIconClick() {
    const post = {
      userId: user._id,
      desc: post_content.current.value + ` from ${user.username}`,
    };

    try {
      const res = await axios.post("posts/", post);
      setPosts((prev) => [res.data, ...prev]);
      let sendIcon = document.querySelector(".input-send");
      sendIcon.value = "";
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="new-post">
      <img src={profile_picture} alt="" />
      <input
        type="text"
        placeholder="What's on your mind"
        ref={post_content}
        className="input-send"
        onKeyDown={handleKeyPress}
      />
      <SendIcon className="send-icon" onClick={handleSendIconClick} />
    </div>
  );
}

export default NewPost;
