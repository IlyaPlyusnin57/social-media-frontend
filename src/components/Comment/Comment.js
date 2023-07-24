import "./Comment.scss";
import "../Feed/Timeline/Post.scss";
import { format } from "timeago.js";
import { memo, useState, useRef, useReducer, useCallback } from "react";
import { getUser, likeDislikeComment, getCommentReply } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { editComment, deleteComment, createComment } from "../../apiCalls";
import { useAuth } from "../../context/AuthContext";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import InputWithButtons from "../InputWithButtons/InputWithButtons";
import usePosts3 from "../../api/usePosts3";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

function reducer(state, action) {
  switch (action.type) {
    case "update_likes": {
      const new_dislikes = state.isDisliked
        ? state.dislikes - 1
        : state.dislikes;
      const new_likes = state.isLiked ? state.likes - 1 : state.likes + 1;

      return {
        dislikes: new_dislikes,
        likes: new_likes,
        isLiked: !state.isLiked,
      };
    }
    case "update_dislikes": {
      const likes = state.isLiked ? state.likes - 1 : state.likes;
      const new_dislikes = state.isDisliked
        ? state.dislikes - 1
        : state.dislikes + 1;

      return {
        likes: likes,
        dislikes: new_dislikes,
        isDisliked: !state.isDisliked,
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

const Comment = memo(function Comment({
  _id,
  text,
  profilePicture,
  username,
  createdAt,
  navigateToUser,
  userId,
  likes,
  dislikes,
  setComments,
  setCommentNum,
  post,
  removePostFromPage,
  replies,
  commentType,
  setReplyNumParent,
  parentId,
}) {
  const api = useAxiosConfig2();
  const [dropDown, setDropDown] = useState(false);
  const [edit, setEdit] = useState(false);
  const editValue = useRef(null);
  const [isDisabled, setDisabled] = useState(true);
  const [commentText, setCommentText] = useState(text);
  const { user: currentUser, socket } = useAuth();
  const [isThumbUp, setThumbUp] = useState(false);
  const [isThumbDown, setThumbDown] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const replyValue = useRef(null);
  const [showReplies, setShowReplies] = useState(false);
  const [repleNum, setReplyNum] = useState(replies);

  const [state, dispatch] = useReducer(reducer, {
    likes: likes.length,
    dislikes: dislikes.length,
    isLiked: likes.includes(currentUser._id),
    isDisliked: dislikes.includes(currentUser._id),
  });

  const [lastReplyCommentId, setLastReplyCommentId] = useState(null);
  const [isEnabled, setEnabled] = useState(false);

  const queryFunction = useCallback(() => {
    return getCommentReply(api, {
      commentId: _id,
      lastReplyCommentId,
    });
  }, [api, lastReplyCommentId, _id]);

  const {
    isError: isCommentError,
    error: commentError,
    isFetching: isCommentFetching,
    posts: commentReplies,
    setPosts: setCommentReplies,
    hasNextPage,
    nextPostId,
  } = usePosts3(
    _id,
    lastReplyCommentId,
    queryFunction,
    5,
    isEnabled,
    removePostFromPage
  );

  const comments = commentReplies.map((comment) => {
    const props = {
      ...comment,
      navigateToUser,
      setComments: setCommentReplies,
      setCommentNum,
      post,
      removePostFromPage,
      setReplyNumParent: setReplyNum,
      commentType: "commentReply",
      parentId: _id,
    };

    return <Comment key={comment._id} {...props} />;
  });

  async function goToUser() {
    const user = await getUser(api, userId);
    navigateToUser(user);
  }

  async function finishEditing() {
    const value = editValue.current.value;

    const res = await editComment(api, {
      commentId: _id,
      text: value,
      type: commentType,
      postId: post._id,
    });

    if (res.status === 200) {
      setCommentText(value);
      setEdit(false);
    } else if (res.status === 404) {
      alert("Post does not exist anymore!");
      removePostFromPage();
    }
  }

  async function handleDeleteComment() {
    const parentCommentId = commentType === "comment" ? null : parentId;

    const res = await deleteComment(
      api,
      _id,
      currentUser,
      post,
      commentType,
      parentCommentId
    );

    if (res.status === 200) {
      setComments((comments) => {
        return comments.filter((comment) => {
          return comment._id !== _id;
        });
      });

      setCommentNum((prev) => --prev);

      if (commentType === "commentReply") {
        setReplyNumParent((prev) => --prev);
      }

      if (currentUser._id !== post.userId) {
        socket?.emit("sendComment", res.data);
      }
    } else if (res.status === 404) {
      alert("Post does not exist anymore!");
      removePostFromPage();
    }
  }

  function changeComment() {
    setDisabled(text === editValue.current.value);
  }

  function handleThumbUp() {
    if (isThumbUp) {
      setThumbUp(false);
      setThumbDown(false);
    } else {
      setThumbUp(true);
      setThumbDown(false);
    }
  }

  function handleThumbDown() {
    if (isThumbDown) {
      setThumbUp(false);
      setThumbDown(false);
    } else {
      setThumbUp(false);
      setThumbDown(true);
    }
  }

  function loadComments() {
    if (hasNextPage) {
      setLastReplyCommentId(nextPostId);
    }
  }

  async function likeDislike(isLiking) {
    const res = await likeDislikeComment(
      api,
      post,
      _id,
      currentUser,
      isLiking,
      commentType
    );

    if (res.status === 200) {
      if (currentUser._id !== userId) {
        socket?.emit("sendLike", res.data);
      }

      if (isLiking) {
        dispatch({ type: "update_likes" });
      } else {
        dispatch({ type: "update_dislikes" });
      }
    } else if (res.status === 404) {
      alert("Post does not exist anymore!");
      removePostFromPage();
    }
  }

  async function handleReply() {
    if (commentType === "commentReply") return;

    const res = await createComment(api, {
      type: "commentReply",
      postUserId: post.userId,
      commenter: currentUser,
      commentBody: {
        commentId: _id,
        userId: currentUser._id,
        text: replyValue.current.value,
        postId: post._id,
        username: currentUser.username,
        profilePicture,
      },
    });

    if (res?.status === 200) {
      replyValue.current.value = "";
      setShowReplyInput(false);
      const { newComment, commentObject } = res.data;

      if (showReplies === false) {
        setShowReplies(true);
      }

      setReplyNum((prev) => ++prev);

      setCommentNum((prev) => ++prev);
      setCommentReplies((prev) => [newComment, ...prev]);
    }
  }

  return (
    <>
      <section className="comment">
        <img src={profilePicture} alt="" />
        <div id="comment-info-wrapper">
          <div id="comment-info">
            <div id="comment-content">
              <div>
                <span className="username margin-right" onClick={goToUser}>
                  {username}
                </span>
                <span className="post-date">{format(createdAt)}</span>
              </div>
              {edit ? (
                <>
                  <input
                    type="text"
                    defaultValue={text}
                    ref={editValue}
                    onChange={changeComment}
                  />
                  <div className="edit-buttons">
                    <button className="button" onClick={() => setEdit(false)}>
                      Cancel
                    </button>
                    <button
                      className="button"
                      onClick={finishEditing}
                      disabled={isDisabled}
                    >
                      Edit
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="comment-text">{commentText}</p>
                  <div className="thumbs-container">
                    <div className="thumb" onClick={() => likeDislike(true)}>
                      {state.isLiked ? (
                        <ThumbUpAltIcon
                          className="icon"
                          onClick={handleThumbUp}
                        />
                      ) : (
                        <ThumbUpOffAltIcon
                          className="icon"
                          onClick={handleThumbUp}
                        />
                      )}

                      <span className="counter">{state.likes}</span>
                    </div>

                    <div className="thumb" onClick={() => likeDislike(false)}>
                      {state.isDisliked ? (
                        <ThumbDownAltIcon
                          className="icon"
                          onClick={handleThumbDown}
                        />
                      ) : (
                        <ThumbDownOffAltIcon
                          className="icon"
                          onClick={handleThumbDown}
                        />
                      )}
                      <span className="counter">{state.dislikes}</span>
                    </div>

                    <span
                      className="icon"
                      onClick={() => setShowReplyInput(true)}
                    >
                      Reply
                    </span>
                  </div>
                  {repleNum > 0 && (
                    <div
                      className="icon view-replies"
                      onClick={() => {
                        setEnabled(true);
                        setShowReplies((prev) => !prev);
                      }}
                    >
                      View {repleNum} {repleNum === 1 ? "reply" : "replies"}
                      {showReplies ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            {currentUser._id === userId && (
              <div id="vert-icon-container">
                <section className="icon-wrapper">
                  <MoreVertIcon
                    className="vert-icon"
                    onClick={() => setDropDown((prev) => !prev)}
                  />
                  {dropDown && (
                    <section className="comment-drop-down">
                      <ul>
                        <li
                          onClick={() => {
                            setDropDown(false);
                            setEdit(true);
                          }}
                        >
                          Edit
                        </li>

                        <li onClick={handleDeleteComment}>Delete</li>
                      </ul>
                    </section>
                  )}
                </section>
              </div>
            )}
            {showReplyInput && (
              <div id="input-with-buttons">
                <InputWithButtons
                  {...{
                    inputPlaceholder: "Add a Reply",
                    actionType: "Reply",
                    handleCancel: () => setShowReplyInput(false),
                    handleAction: handleReply,
                    inputRef: replyValue,
                  }}
                />
              </div>
            )}
          </div>
          {<section id="replies">{showReplies && comments}</section>}
        </div>
      </section>
    </>
  );
});

export default Comment;
