import { getPaginatedFeed, getFeedOrPage } from "../apiCalls";
import { useState, useRef, useEffect, useLayoutEffect } from "react";

function usePosts2(profile, api, currentUser) {
  const [hasNextPage, setHasNextPage] = useState(false);
  const [posts, setPosts] = useState([]);
  const nextPostId = useRef(null);
  const [lastPostId, setLastPostId] = useState(null);

  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPosts([]);
  }, [profile]);

  const url = profile ? `/posts/user2/` : `/posts/${currentUser._id}/all`;

  useLayoutEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const queryFunction = profile
      ? getPaginatedFeed(api, url, {
          userId: currentUser._id,
          lastPostId,
          signal,
        })
      : getFeedOrPage(api, url, { signal });

    setIsFetching(true);
    setIsError(false);
    setError(null);

    queryFunction
      .then((data) => {
        setPosts((prev) => [...prev, ...data]);
        setIsFetching(false);
        setHasNextPage(data.length === 10);
        nextPostId.current =
          data.length === 10 ? data[data.length - 1]._id : null;
      })
      .catch((e) => {
        setIsFetching(false);
        if (signal.aborted) return;
        setError({ message: e.message });
      });

    return () => controller.abort();
  }, [profile, api, url, currentUser._id, lastPostId]);

  return {
    isError,
    error,
    isFetching,
    posts,
    setPosts,
    hasNextPage,
    setLastPostId,
    nextPostId,
  };
}

export default usePosts2;
