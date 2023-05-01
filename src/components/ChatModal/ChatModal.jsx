import "./ChatModal.scss";
import CloseIcon from "@mui/icons-material/Close";

import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useState } from "react";

function ChatModal({ onClose, friend, refetch }) {
  const [disabled, setDisabled] = useState(false);
  const { register, handleSubmit, control } = useForm({
    mode: "onChange",
    defaultValues: {
      message: "",
    },
  });

  const { user } = useAuth();

  async function sendMessage(formData) {
    try {
      const res = await axios.post("/conversations", {
        senderId: user._id,
        receiverId: friend._id,
      });

      const message = await axios.post("/messages", {
        senderId: user._id,
        message: formData.message,
        conversationId: res.data._id,
      });

      setDisabled(true);
      refetch();
      onClose();
      console.log(message);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="chat-modal-wrapper">
      <div className="chat-modal">
        <div className="close-icon-wrapper">
          <CloseIcon onClick={onClose} />
        </div>
        <form className="chat-form" onSubmit={handleSubmit(sendMessage)}>
          <textarea
            {...register("message")}
            id="textarea"
            placeholder="Type your message here"
          ></textarea>
          <button type="submit" className="button" disabled={disabled}>
            Send a Message
          </button>
        </form>
        <DevTool control={control} /> {/* set up the dev tool */}
      </div>
    </div>
  );
}

export default ChatModal;
