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

function ShowPost() {
  const { state: postId } = useLocation();
  const api = useAxiosConfig2();
  const { user, profile_picture } = useAuth();
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["show-post", postId],
    queryFn: () => getPost(api, postId),
  });

  const isLiked = post?.likes.includes(user._id);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
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
      <div className="post-content">
        <div className="text-content">{post?.desc + " " + post.userId}</div>
        {post?.img && (
          <div className="img-content">
            <img src={PF + post.img} alt="" />
          </div>
        )}
      </div>
      <div className="post-footer">
        <Box className="icon-wrapper post-likes">
          {isLiked ? (
            <FavoriteIcon className="post-footer-icon red-heart-icon" />
          ) : (
            <FavoriteBorderIcon className="post-footer-icon" />
          )}

          <span>{post.likes.length}</span>
        </Box>

        <Box className="icon-wrapper">
          <ChatBubbleOutlineIcon className="post-footer-icon" />
        </Box>
        <Box className="icon-wrapper">
          <ShareIcon className="post-footer-icon" />
        </Box>
      </div>
    </div>
  );
}

export default ShowPost;
