import { useLocation } from "react-router-dom";
import { getPost } from "../../apiCalls";
import { useQuery } from "@tanstack/react-query";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { useAuth } from "../../context/AuthContext";
import { format } from "timeago.js";

import Box from "@mui/material/Box";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LikerList from "../../components/LikerList/LikerList";
import { useState } from "react";

function ShowPost() {
  const { state: postId } = useLocation();
  const api = useAxiosConfig2();
  const { user, profile_picture } = useAuth();
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [showList, setShowList] = useState(false);

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [postId],
    queryFn: () => getPost(api, postId),
    refetchOnWindowFocus: false,
  });

  if (!post) {
    return <div className="post">Post does not exist anymore</div>;
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  const isLiked = post?.likes.includes(user._id);

  function addDislay() {
    setShowList(true);
  }

  function removeDisplay() {
    setShowList(false);
  }

  return (
    <div className="post">
      <div className="post-title">
        <img src={profile_picture} alt="" />
        <div className="post-info margin-left">
          <div className="username">{user?.username}</div>
          <div className="post-date">{format(post.createdAt)}</div>
        </div>
      </div>

      <div className="content-wrapper" onMouseLeave={removeDisplay}>
        <div className="post-content">
          <div className="text-content">{post?.desc + " " + post.userId}</div>
          {post?.img && (
            <div className="img-content">
              <img src={PF + post.img} alt="" />
            </div>
          )}
        </div>

        {showList && <LikerList {...{ removeDisplay, post }} />}

        <div className="post-footer">
          <Box className="icon-wrapper post-likes" onMouseEnter={addDislay}>
            {isLiked ? (
              <FavoriteIcon className="post-footer-icon red-heart-icon" />
            ) : (
              <FavoriteBorderIcon className="post-footer-icon" />
            )}

            <span>{post.likes.length}</span>
          </Box>

          {/* <Box className="icon-wrapper">
            <ChatBubbleOutlineIcon className="post-footer-icon" />
          </Box>
          <Box className="icon-wrapper">
            <ShareIcon className="post-footer-icon" />
          </Box> */}
        </div>
      </div>
    </div>
  );
}

export default ShowPost;
