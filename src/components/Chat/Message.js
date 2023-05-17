import "./Message.scss";

import { forwardRef, memo } from "react";
import { getMonthAndDay } from "../../helper_functions/monthAndDay";
import { getTime } from "../../helper_functions/getTime";

const Message = memo(
  forwardRef(({ message, own, time, separate }, ref) => {
    return (
      <div
        ref={ref}
        className={own ? "message-container own" : "message-container"}
        data-time={getMonthAndDay(time)}
      >
        {separate && (
          <section className="date-separator-wrapper">
            <div className="date-separator">{getMonthAndDay(time)}</div>
          </section>
        )}

        <div className={own ? "message own" : "message"}>
          <div className="message-content">{message}</div>
          <section className="time">{getTime(time)}</section>
        </div>
      </div>
    );
  })
);

export default Message;
