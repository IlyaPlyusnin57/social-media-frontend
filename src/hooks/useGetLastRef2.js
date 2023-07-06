import { useCallback, useRef } from "react";

export function useGetLastRef2(
  isFetching,
  nextPostId,
  setLastPostId,
  fetchNextUser,
  nextUserId,
  setUserId,
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
          if (fetchNextUser) {
            setUserId(nextUserId);
          }
        }
      });

      if (element) intObserver.current.observe(element);
    },
    [
      isFetching,
      setLastPostId,
      nextPostId,
      fetchNextUser,
      nextUserId,
      setUserId,
      hasFinished,
    ]
  );

  return lastRef;
}
