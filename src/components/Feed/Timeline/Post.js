import "./Post.scss";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteIcon from "@mui/icons-material/Favorite";

import Box from "@mui/material/Box";
import {
  useReducer,
  forwardRef,
  memo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { format } from "timeago.js";
import { useAuth } from "../../../context/AuthContext";
import DeleteIcon from "@mui/icons-material/Delete";
import useAxiosConfig2 from "../../../api/useAxiosConfig2";
import {
  getUser,
  getUser2,
  createComment,
  getComment,
  likePost,
  getPost,
} from "../../../apiCalls";

import profilePicture from "../../../helper_functions/profilePicture";
import { useQuery } from "@tanstack/react-query";
import { PF } from "../../../helper_functions/PF";
import { useNavigate } from "react-router-dom";
import LikerList from "../../LikerList/LikerList";
import TextInput from "../../TextInput/TextInput";
import Comment from "../../Comment/Comment";
import usePosts3 from "../../../api/usePosts3";

function reducer(state, action) {
  switch (action.type) {
    case "update_likes": {
      const new_likes = state.isLiked ? state.likes - 1 : state.likes + 1;

      return {
        likes: new_likes,
        isLiked: !state.isLiked,
      };
    }
    case "set_likes": {
      const likes = action.payload;

      return {
        ...state,
        likes: likes,
      };
    }

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
  setShowComments,
  commentNum,
  setEnabled,
  removePostFromPage,
  dispatch,
  currentUser,
}) {
  const [showList, setShowList] = useState(false);

  function addDislay() {
    if (post.userId === currentUser._id) {
      setShowList(true);
    }
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
          >{`${user?.first_name} ${user?.last_name} (${user.username})`}</div>
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

        <div className="post-footer">
          {showList && (
            <LikerList
              {...{
                removeDisplay,
                post,
                likes: state.likes,
                removePost: removePostFromPage,
                dispatch,
              }}
            />
          )}
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

            <span className="like-count">{state.likes}</span>
          </Box>

          <Box
            className="icon-wrapper"
            onClick={() => {
              setShowComments((prev) => !prev);
              setEnabled(true);
            }}
          >
            <ChatBubbleOutlineIcon className="post-footer-icon" />
            <span className="like-count">{commentNum}</span>
          </Box>
          {/* <Box className="icon-wrapper">
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
    const [showComments, setShowComments] = useState(false);
    const [commentNum, setCommentNum] = useState(post.comments);
    const commentValue = useRef(null);
    const [lastCommentId, setLastCommentId] = useState(null);
    const [isEnabled, setEnabled] = useState(false);

    const queryFunction = useCallback(() => {
      return getComment(api, {
        postId: post._id,
        lastCommentId,
      });
    }, [api, post._id, lastCommentId]);

    const {
      isError: isCommentError,
      error: commentError,
      isFetching: isCommentFetching,
      posts: comments,
      setPosts: setComments,
      hasNextPage,
      nextPostId,
    } = usePosts3(
      post,
      lastCommentId,
      queryFunction,
      5,
      isEnabled,
      removePostFromPage
    );

    useEffect(() => {
      const fetchPost = async () => {
        const result = await getPost(api, post._id);
        setCommentNum(result.comments);
      };

      fetchPost();
    }, [comments, api, post._id]);

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
      const res = await likePost(api, post._id, currentUser);

      if (res?.status === 200) {
        const { liker, likedUser } = res.data;

        if (liker._id !== likedUser) {
          socket?.emit("sendLike", res.data);
        }

        dispatch({ type: "update_likes" });
      } else if (res.status === 404) {
        alert("Post does not exist anymore!");
        removePostFromPage();
      }
    }

    function removePostFromPage() {
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    }

    async function handleDelete() {
      const userId = { data: { userId: currentUser._id, postId: post._id } };
      try {
        await api.delete(`posts/${post._id}`, userId);
        removePostFromPage();
      } catch (error) {
        console.log(error);
      }
    }

    function navigateToUser(user) {
      navigate("/search-profile", { state: user });
    }

    function handleKeyPress(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSendIconClick();
      }
    }

    function loadComments() {
      if (hasNextPage) {
        setLastCommentId(nextPostId);
      }
    }

    async function handleSendIconClick() {
      const res = await createComment(api, {
        type: "comment",
        postUserId: post.userId,
        commenter: currentUser,
        commentBody: {
          userId: currentUser._id,
          text: commentValue.current.value,
          postId: post._id,
          username: currentUser.username,
          profilePicture: profilePicture(currentUser),
        },
      });

      commentValue.current.value = "";

      if (res.status === 200) {
        const { newComment, commentObject } = res.data;

        if (currentUser._id !== post.userId) {
          socket?.emit("sendComment", commentObject);
        }

        setCommentNum((prev) => ++prev);
        setComments((prev) => [newComment, ...prev]);
      } else if (res.status === 404) {
        alert("Post does not exist anymore!");
        removePostFromPage();
      }
    }

    const commentList = comments.map((comment) => {
      const props = {
        ...comment,
        navigateToUser,
        setComments,
        setCommentNum,
        post,
        removePostFromPage,
      };

      return <Comment key={comment._id} {...props} />;
    });

    return (
      <div className="post-wrapper" ref={ref}>
        <section className="post">
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
              setShowComments,
              commentNum,
              setEnabled,
              removePostFromPage,
              dispatch,
              currentUser,
            }}
          />
        </section>

        {showComments && (
          <section className="comment-wrapper">
            <TextInput
              {...{
                profile_picture,
                placeholder: "Leave a comment",
                size: 30,
                post_content: commentValue,
                handleSendIconClick,
                handleKeyPress,
              }}
            />

            {commentList}
            {hasNextPage && (
              <div className="username margin-top" onClick={loadComments}>
                Load more comments...
              </div>
            )}
          </section>
        )}
      </div>
    );
  })
);

export default Post;
