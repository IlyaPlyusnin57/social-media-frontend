import { useCallback, useRef } from "react";

export function useGetLastRef(isFetching, hasNextPage, nextId, setLastId) {
  const intObserver = useRef();

  const lastRef = useCallback(
    (element) => {
      if (isFetching) return;

      if (intObserver.current) intObserver.current.disconnect();

      intObserver.current = new IntersectionObserver((elements) => {
        if (elements[0].isIntersecting && hasNextPage) {
          if (nextId) setLastId(nextId);
          intObserver.current.unobserve(elements[0].target);
        }
      });

      if (element) intObserver.current.observe(element);
    },
    [isFetching, hasNextPage, setLastId, nextId]
  );

  return lastRef;
}
