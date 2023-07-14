import "../Feed/Timeline/NewPost.scss";
import SendIcon from "@mui/icons-material/Send";

function TextInput({
  profile_picture,
  post_content,
  handleKeyPress,
  handleInput,
  handleSendIconClick,
  placeholder,
}) {
  return (
    <section id="new-post-input">
      <img src={profile_picture} alt="" />
      <input
        type="text"
        placeholder={placeholder}
        ref={post_content}
        className="input-send"
        onKeyDown={handleKeyPress}
        onInput={handleInput}
      />

      <SendIcon className="new-post-send-icon" onClick={handleSendIconClick} />
    </section>
  );
}

export default TextInput;
