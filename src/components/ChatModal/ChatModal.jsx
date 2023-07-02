import "./ChatModal.scss";
import CloseIcon from "@mui/icons-material/Close";

import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { sendMessagetoUser, createConversation } from "../../apiCalls";

function ChatModal({ onClose, friend, refetch }) {
  const [disabled, setDisabled] = useState(false);
  const { register, handleSubmit, control } = useForm({
    mode: "onChange",
    defaultValues: {
      message: "",
    },
  });

  const { user, socket } = useAuth();

  const api = useAxiosConfig2();

  async function sendMessage(formData) {
    const conversation = await createConversation(api, {
      senderId: user._id,
      receiverId: friend._id,
    });

    const res = await sendMessagetoUser(
      api,
      user._id,
      formData.message,
      conversation?._id
    );

    if (res.status === 200) {
      socket?.emit("sendMessage", friend._id, res.data);
    }

    setDisabled(true);
    refetch();
    onClose();
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
