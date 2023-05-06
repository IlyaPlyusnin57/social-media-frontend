import "./Message.scss";

import { forwardRef, memo } from "react";

function getTime(time) {
  const newTime = new Date(time);
  return new Intl.DateTimeFormat("default", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  }).format(newTime);
}

const Message = memo(
  forwardRef(({ message, own, time }, ref) => {
    return (
      <div
        ref={ref}
        className={own ? "message-container own" : "message-container"}
      >
        <div className={own ? "message own" : "message"}>
          <div className="message-content">{message}</div>
          <section className="time">{getTime(time)}</section>
        </div>
      </div>
    );
  })
);

export default Message;
