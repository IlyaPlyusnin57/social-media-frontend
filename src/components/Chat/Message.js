import "./Message.scss";

import { forwardRef, memo, useRef, useCallback } from "react";
import { getMonthAndDay } from "../../helper_functions/monthAndDay";
import { getTime } from "../../helper_functions/getTime";

const Message = memo(
  forwardRef(({ message, own, time }, ref) => {
    return (
      <div
        ref={ref}
        className={own ? "message-container own" : "message-container"}
      >
        <div className={own ? "message own" : "message"} ref={messageRef}>
          <div className="message-content" ref={refPosition}>
            {message}
          </div>
          <section className="time">{getTime(time)}</section>
        </div>
      </div>
    );
  })
);

export default Message;
