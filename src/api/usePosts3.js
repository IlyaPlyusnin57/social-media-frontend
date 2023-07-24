import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

function usePosts3(
  userId,
  lastPostId,
  queryFunction,
  length,
  isEnabled,
  removePost
) {
  const hasNextPage = useRef(false);
  const [posts, setPosts] = useState([]);
  const nextPostId = useRef(null);

  useEffect(() => {
    setPosts([]);
  }, [isEnabled]);

  const { isError, error, isFetching } = useQuery({
    queryKey: [userId, lastPostId],
    queryFn: queryFunction,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data?.status === 404) {
        alert("Post does not exist");
        setPosts([]);
        removePost();
        return;
      }

      console.log({ receivedData: data });
      setPosts((prev) => [...prev, ...data]);
      console.log("success!");
      hasNextPage.current = data.length === length;
      nextPostId.current =
        data.length === length ? data[data.length - 1]._id : null;
    },
    enabled: isEnabled,
  });

  return {
    isError,
    error,
    isFetching,
    posts,
    setPosts,
    hasNextPage: hasNextPage.current,
    nextPostId: nextPostId.current,
  };
}

export default usePosts3;
