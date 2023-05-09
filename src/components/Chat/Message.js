import "./Message.scss";

import { forwardRef, memo, useRef, useCallback } from "react";

function getTime(time) {
  const newTime = new Date(time);
  return new Intl.DateTimeFormat("default", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  }).format(newTime);
}

function getMonthAndDay(time) {
  const date = new Date(time);
  return new Intl.DateTimeFormat("default", {
    month: "long",
    day: "numeric",
  }).format(date);
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
