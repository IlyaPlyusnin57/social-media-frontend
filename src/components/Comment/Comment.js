import "./Comment.scss";
import "../Feed/Timeline/Post.scss";
import { format } from "timeago.js";
import {
  memo,
  useState,
  useRef,
  useReducer,
  useCallback,
  useMemo,
} from "react";
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
import TaggedUser from "../TaggedUser.js/TaggedUser";

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
  edited,
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
  const [replyNum, setReplyNum] = useState(replies);
  const [isEdited, setEdited] = useState(edited);

  const { taggedUser, untaggedText } = useMemo(() => {
    if (commentText.at(0) !== "@") {
      return {
        taggedUser: null,
        untaggedText: commentText,
      };
    }

    const textArray = commentText.split(" ");
    const taggedUser = textArray[0];
    textArray.shift();

    return {
      taggedUser,
      untaggedText: textArray.join(" "),
    };
  }, [commentText]);

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
      lastCommentReplyId: lastReplyCommentId,
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

  function handleFinishEditing(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      finishEditing();
    }
  }

  async function finishEditing() {
    let value = taggedUser ? `${taggedUser} ` : "";

    value += editValue.current.value;

    const res = await editComment(api, {
      commentId: _id,
      commenter: currentUser,
      text: value,
      type: commentType,
      postId: post._id,
      postUserId: post.userId,
    });

    if (res.status === 200) {
      setCommentText(value);
      setEdit(false);
      !isEdited && setEdited(true);
      if (currentUser._id !== post.userId) {
        socket?.emit("sendComment", res.data);
      }
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
    const commentText = replyValue.current.value;
    const finalContent =
      currentUser.username === username
        ? commentText
        : `@${username} ${commentText}`;

    const res = await createComment(api, {
      type: "commentReply",
      postUserId: post.userId,
      commenter: currentUser,
      parentUserId: userId,
      commentBody: {
        commentId: commentType === "commentReply" ? parentId : _id,
        userId: currentUser._id,
        text: finalContent,
        postId: post._id,
        username: currentUser.username,
        profilePicture,
      },
    });

    if (res?.status === 200) {
      replyValue.current.value = "";
      setShowReplyInput(false);
      const { newComment, commentObject, replyObject } = res.data;

      if (showReplies === false) {
        setShowReplies(true);
      }

      setReplyNum((prev) => ++prev);

      setCommentNum((prev) => ++prev);

      if (commentType === "commentReply") {
        setComments((prev) => [...prev, newComment]);
        setReplyNumParent((prev) => ++prev);
      } else {
        setCommentReplies((prev) => [...prev, newComment]);
      }

      if (replyObject && currentUser._id !== userId) {
        socket?.emit("sendComment", replyObject);
      }

      if (currentUser._id !== post.userId) {
        socket?.emit("sendComment", commentObject);
      }
    } else if (res?.status === 404) {
      alert("Post does not exist anymore!");
      removePostFromPage();
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
                <span className="post-date">
                  {format(createdAt)} {isEdited && "(edited)"}
                </span>
              </div>
              {edit ? (
                <>
                  <input
                    type="text"
                    defaultValue={untaggedText}
                    ref={editValue}
                    onChange={changeComment}
                    onKeyDown={handleFinishEditing}
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
                  <p className="comment-text">
                    <TaggedUser
                      {...{
                        api,
                        contentArr: commentText.split(" "),
                      }}
                    />
                  </p>
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
                  {replyNum > 0 && (
                    <div
                      className="icon view-replies"
                      onClick={() => {
                        setEnabled(true);
                        setShowReplies((prev) => !prev);
                      }}
                    >
                      View {replyNum} {replyNum === 1 ? "reply" : "replies"}
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
          {hasNextPage && commentType === "comment" && (
            <div className="username margin-top" onClick={loadComments}>
              Load more comments...
            </div>
          )}
        </div>
      </section>
    </>
  );
});

export default Comment;
