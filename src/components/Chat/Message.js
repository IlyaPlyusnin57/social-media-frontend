import "./Message.scss";

import { forwardRef, memo, useRef, useCallback } from "react";
import { getMonthAndDay } from "../../helper_functions/monthAndDay";
import { getTime } from "../../helper_functions/getTime";

const Message = memo(
  forwardRef(({ message, own, time }, ref) => {
    const intObserver = useRef();
    const refPosition = useRef();

    const messageRef = useCallback(
      (element) => {
        if (intObserver.current) intObserver.current.disconnect();

        intObserver.current = new IntersectionObserver((elements) => {
          if (elements[0].isIntersecting && refPosition.current) {
            const lastMessageDatePosition = document.querySelector(
              ".current-conversation-month"
            );

            const messagePositionY =
              refPosition.current.getBoundingClientRect().y;
            const lastMessageDatePositionY = document
              .querySelector(".current-conversation-month")
              ?.getBoundingClientRect().y;

            if (messagePositionY > lastMessageDatePositionY) {
              lastMessageDatePosition.innerHTML = getMonthAndDay(time);
            }
          }
        });

        if (element) intObserver.current.observe(element);
      },
      [time]
    );

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
