import "./Post.scss";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";

import Box from "@mui/material/Box";
import { useReducer, forwardRef, memo } from "react";
import { format } from "timeago.js";
import { useAuth } from "../../../context/AuthContext";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import useAxiosConfig2 from "../../../api/useAxiosConfig2";

function reducer(state, action) {
  let new_likes = state.isLiked ? state.likes - 1 : state.likes + 1;

  switch (action.type) {
    case "update_likes":
      return {
        likes: new_likes,
        isLiked: !state.isLiked,
      };
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

// const Post = memo(
//   forwardRef(({ post, setPosts, user, profile_picture }, ref) => {
//     const PF = process.env.REACT_APP_PUBLIC_FOLDER;
//     const { user: currentUser } = useAuth();

//     const [state, dispatch] = useReducer(reducer, {
//       likes: post.likes.length,
//       isLiked: post.likes.includes(currentUser._id),
//     });

//     async function updateLikes() {
//       try {
//         axios.put(`posts/${post._id}/like`, { userId: `${currentUser._id}` });
//         dispatch({ type: "update_likes" });
//       } catch (error) {
//         console.log(error);
//       }
//     }

//     async function handleDelete() {
//       const userId = { data: { userId: user._id } };
//       try {
//         await axios.delete(`posts/${post._id}`, userId);
//         setPosts((prev) => prev.filter((p) => p._id !== post._id));
//       } catch (error) {
//         console.log(error);
//       }
//     }

//     return (
//       <div className="post" ref={ref}>
//         {currentUser._id === post.userId && currentUser._id === user._id && (
//           <div className="delete-icon-container">
//             <DeleteIcon className="delete-icon" onClick={handleDelete} />
//           </div>
//         )}

//         <div className="post-title">
//           <img src={profile_picture} alt="" />
//           <div className="post-info margin-left">
//             <div className="username">{user?.username}</div>
//             <div className="post-date">{format(post.createdAt)}</div>
//           </div>
//         </div>
//         <div className="post-content">
//           <div className="text-content">{post?.desc + " " + post.userId}</div>
//           {post?.img && (
//             <div className="img-content">
//               <img src={PF + post.img} alt="" />
//             </div>
//           )}
//         </div>
//         <div className="post-footer">
//           <Box className="icon-wrapper post-likes" onClick={updateLikes}>
//             {state.isLiked ? (
//               <FavoriteIcon className="post-footer-icon red-heart-icon" />
//             ) : (
//               <FavoriteBorderIcon className="post-footer-icon" />
//             )}

//             <span>{state.likes}</span>
//           </Box>

//           <Box className="icon-wrapper">
//             <ChatBubbleOutlineIcon className="post-footer-icon" />
//           </Box>
//           <Box className="icon-wrapper">
//             <ShareIcon className="post-footer-icon" />
//           </Box>
//         </div>
//       </div>
//     );
//   })
// );

const Post = forwardRef(({ post, setPosts, user, profile_picture }, ref) => {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { user: currentUser, socket } = useAuth();
  const api = useAxiosConfig2();

  const [state, dispatch] = useReducer(reducer, {
    likes: post.likes.length,
    isLiked: post.likes.includes(currentUser._id),
  });

  async function updateLikes() {
    try {
      const res = await api.put(`posts/${post._id}/like`, {
        user: currentUser,
      });

      if (res?.status === 200) {
        socket?.emit("sendLike", res.data);
      }

      dispatch({ type: "update_likes" });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDelete() {
    const userId = { data: { userId: user._id } };
    try {
      await api.delete(`posts/${post._id}`, userId);
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="post" ref={ref}>
      {currentUser._id === post.userId && currentUser._id === user._id && (
        <div className="delete-icon-container">
          <DeleteIcon className="delete-icon" onClick={handleDelete} />
        </div>
      )}

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
        <Box className="icon-wrapper post-likes" onClick={updateLikes}>
          {state.isLiked ? (
            <FavoriteIcon className="post-footer-icon red-heart-icon" />
          ) : (
            <FavoriteBorderIcon className="post-footer-icon" />
          )}

          <span>{state.likes}</span>
        </Box>

        {/* <Box className="icon-wrapper">
          <ChatBubbleOutlineIcon className="post-footer-icon" />
        </Box>
        <Box className="icon-wrapper">
          <ShareIcon className="post-footer-icon" />
        </Box> */}
      </div>
    </div>
  );
});

export default Post;
