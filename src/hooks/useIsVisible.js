import { useState, useCallback, useRef } from "react";

export function useIsVisible() {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useRef();

  const ref = useCallback((message) => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(([message]) => {
      if (message.isIntersecting) console.log("Bottom message is intersecting");
      else console.log("Bottom message is not intersecting");
    });

    if (message) observer.current.observe(message);
  }, []);

  return ref;
}
