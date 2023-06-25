import { getPaginatedFeed, getFeedOrPage } from "../apiCalls";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function usePosts(profile, api, currentUser) {
  const [hasNextPage, setHasNextPage] = useState(false);
  const [posts, setPosts] = useState([]);
  const nextPostId = useRef(null);
  const [lastPostId, setLastPostId] = useState(null);

  useEffect(() => {
    setPosts([]);
    setLastPostId(null);
  }, [profile, currentUser._id]);

  const url = profile ? `/posts/user2/` : `/posts/${currentUser._id}/all`;

  const queryFunction = profile
    ? () =>
        getPaginatedFeed(api, url, {
          userId: currentUser._id,
          lastPostId,
        })
    : () => getFeedOrPage(api, url);

  const { status, error, isFetching } = useQuery({
    queryKey: ["posts", currentUser._id, profile, lastPostId],
    queryFn: queryFunction,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setPosts((prev) => [...prev, ...data]);
      console.log("success!");
      setHasNextPage(data.length === 10);
      nextPostId.current =
        data.length === 10 ? data[data.length - 1]._id : null;
    },
  });

  return {
    status,
    error,
    isFetching,
    posts,
    setPosts,
    hasNextPage,
    setLastPostId,
    nextPostId,
  };
}

export default usePosts;
