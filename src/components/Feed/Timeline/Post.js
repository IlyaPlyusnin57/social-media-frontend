import "./Post.scss";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";

import Box from "@mui/material/Box";
import { useReducer, forwardRef, memo, useState } from "react";
import { format } from "timeago.js";
import { useAuth } from "../../../context/AuthContext";
import DeleteIcon from "@mui/icons-material/Delete";
import useAxiosConfig2 from "../../../api/useAxiosConfig2";
import { getUser, getUser2 } from "../../../apiCalls";
import profilePicture from "../../../helper_functions/profilePicture";
import { useQuery } from "@tanstack/react-query";
import { PF } from "../../../helper_functions/PF";
import { useNavigate } from "react-router-dom";
import LikerList from "../../LikerList/LikerList";

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

function PostContent({
  isLoading,
  isError,
  error,
  profile_picture,
  user,
  post,
  state,
  updateLikes,
  navigateToUser,
  api,
}) {
  const [showList, setShowList] = useState(false);

  function addDislay() {
    setShowList(true);
  }

  function removeDisplay() {
    setShowList(false);
  }

  const arr = post.desc.split(" ");

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      <div className="post-title">
        <img
          src={profile_picture}
          alt=""
          onClick={() => navigateToUser(user)}
        />
        <div className="post-info margin-left">
          <div
            className="username"
            onClick={() => navigateToUser(user)}
          >{`${user?.first_name} ${user?.last_name}`}</div>
          <div className="post-date">{format(post.createdAt)}</div>
        </div>
      </div>

      <div onMouseLeave={removeDisplay}>
        <div className="post-content">
          <div className="text-content">
            <p>
              {arr.map((word, index) => {
                if (word[0] === "@") {
                  return (
                    <span
                      key={index}
                      className="tagged-user"
                      onClick={async () => {
                        const user = await getUser2(api, word.substring(1));
                        navigateToUser(user);
                      }}
                    >
                      {word + " "}
                    </span>
                  );
                }

                return word + " ";
              })}
            </p>
          </div>
          {post?.img && (
            <div className="img-content">
              <img src={PF + post.img} alt="" />
            </div>
          )}
        </div>

        {showList && (
          <LikerList {...{ removeDisplay, post, likes: state.likes }} />
        )}

        <div className="post-footer">
          <Box
            className="icon-wrapper post-likes"
            onClick={updateLikes}
            onMouseEnter={addDislay}
          >
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
    </>
  );
}

const Post = memo(
  forwardRef(function Post({ post, setPosts }, ref) {
    const { user: currentUser, socket } = useAuth();
    const api = useAxiosConfig2();
    const navigate = useNavigate();

    const [state, dispatch] = useReducer(reducer, {
      likes: post.likes.length,
      isLiked: post.likes.includes(currentUser._id),
    });

    const {
      data: user,
      isLoading,
      isError,
      error,
    } = useQuery({
      queryKey: ["post-user", post.userId],
      queryFn: () => getUser(api, post.userId),
      refetchOnWindowFocus: false,
    });

    const profile_picture = profilePicture(user);

    async function updateLikes() {
      try {
        const res = await api.put(`posts/${post._id}/like`, {
          user: currentUser,
        });

        if (res?.status === 200) {
          const { liker, likedUser } = res.data;

          if (liker._id !== likedUser) {
            socket?.emit("sendLike", res.data);
          }
        }

        dispatch({ type: "update_likes" });
      } catch (error) {
        console.log(error);
      }
    }

    async function handleDelete() {
      const userId = { data: { userId: currentUser._id } };
      try {
        await api.delete(`posts/${post._id}`, userId);
        setPosts((prev) => prev.filter((p) => p._id !== post._id));
      } catch (error) {
        console.log(error);
      }
    }

    function navigateToUser(user) {
      navigate("/search-profile", { state: user });
    }

    return (
      <div className="post" ref={ref}>
        {/* && currentUser._id === user._id */}
        {currentUser._id === post.userId && (
          <div className="delete-icon-container">
            <DeleteIcon className="delete-icon" onClick={handleDelete} />
          </div>
        )}

        <PostContent
          {...{
            isLoading,
            isError,
            error,
            profile_picture,
            user,
            post,
            state,
            updateLikes,
            navigateToUser,
            api,
          }}
        />
      </div>
    );
  })
);

export default Post;
