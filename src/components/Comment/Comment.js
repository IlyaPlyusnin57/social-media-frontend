import "./Comment.scss";

function Comment({ text, profile_picture }) {
  return (
    <section className="comment">
      <img src={profile_picture} alt="" />
      <div>{text}</div>
    </section>
  );
}

export default Comment;
