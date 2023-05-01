import "./Message.scss";

import { forwardRef, memo } from "react";

const Message = memo(
  forwardRef(({ message, own }, ref) => {
    return (
      <div
        ref={ref}
        className={own ? "message-container own" : "message-container"}
      >
        <div className={own ? "message own" : "message"}>{message}</div>
      </div>
    );
  })
);

export default Message;
