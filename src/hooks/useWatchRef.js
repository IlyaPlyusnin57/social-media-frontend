import { useRef, useEffect, useCallback } from "react";

export function useWatchRef(setUnseenMessages) {
  const observer = useRef();

  useEffect(() => {
    // observer.current = new IntersectionObserver(([messageEntry]) => {
    //   if (messageEntry.isIntersecting) {
    //     console.log(
    //       `Bottom message is intersecting ${messageEntry.target.innerText}`
    //     );
    //     observer.current.unobserve(messageEntry.target);
    //   } else {
    //     console.log(
    //       `Bottom message is not intersecting ${messageEntry.target.innerText}`
    //     );
    //   }
    // });

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setUnseenMessages((prev) => {
            if (prev === 0) {
              return prev;
            }

            return prev - 1;
          });

          console.log(
            `Bottom message is intersecting ${entry.target.innerText}`
          );
          observer.current.unobserve(entry.target);
        } else {
          setUnseenMessages((prev) => prev + 1);
          console.log(
            `Bottom message is not intersecting ${entry.target.innerText}`
          );
        }
      });
    });
  }, [setUnseenMessages]);

  const ref = useCallback((message) => {
    if (message) {
      observer.current.observe(message);
    }
  }, []);

  return ref;
}
