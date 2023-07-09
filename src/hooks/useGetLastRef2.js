import { useCallback, useRef } from "react";

export function useGetLastRef2(
  isFetching,
  nextPostId,
  setLastPostId,
  hasFinished
) {
  const intObserver = useRef();

  const lastRef = useCallback(
    (element) => {
      if (isFetching) return;

      if (intObserver.current) intObserver.current.disconnect();

      intObserver.current = new IntersectionObserver((elements) => {
        if (elements[0].isIntersecting) {
          if (hasFinished) return;
          if (nextPostId) setLastPostId(nextPostId);
        }
      });

      if (element) intObserver.current.observe(element);
    },
    [isFetching, setLastPostId, nextPostId, hasFinished]
  );

  return lastRef;
}
