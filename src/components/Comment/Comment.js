import "./Comment.scss";
import "../Feed/Timeline/Post.scss";
import { format } from "timeago.js";
import { memo, useState, useRef } from "react";
import { getUser } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { editComment, deleteComment } from "../../apiCalls";
import { useAuth } from "../../context/AuthContext";

const Comment = memo(function Comment({
  _id,
  text,
  profilePicture,
  username,
  createdAt,
  navigateToUser,
  userId,
  setComments,
  setCommentNum,
  post,
  removePostFromPage,
}) {
  const api = useAxiosConfig2();
  const [dropDown, setDropDown] = useState(false);
  const [edit, setEdit] = useState(false);
  const editValue = useRef(null);
  const [isDisabled, setDisabled] = useState(true);
  const [commentText, setCommentText] = useState(text);
  const { user: currentUser, socket } = useAuth();

  async function goToUser() {
    const user = await getUser(api, userId);
    navigateToUser(user);
  }

  async function finishEditing() {
    const value = editValue.current.value;

    const res = await editComment(api, {
      commentId: _id,
      text: value,
      type: "comment",
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
    const res = await deleteComment(api, _id, currentUser, post);

    if (res.status === 200) {
      setComments((comments) => {
        return comments.filter((comment) => {
          return comment._id !== _id;
        });
      });

      setCommentNum((prev) => --prev);

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

  return (
    <section className="comment">
      <img src={profilePicture} alt="" />
      <div className="comment-content">
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
          <p className="comment-text">{commentText}</p>
        )}
      </div>
      {currentUser._id === userId && (
        <div className="vert-icon-container">
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
        </div>
      )}
    </section>
  );
});

export default Comment;
