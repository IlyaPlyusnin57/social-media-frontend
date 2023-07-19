import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

function usePosts3(user, lastPostId, queryFunction, length, isEnabled) {
  const hasNextPage = useRef(false);
  const [posts, setPosts] = useState([]);
  const nextPostId = useRef(null);

  const { isError, error, isFetching } = useQuery({
    queryKey: [user._id, lastPostId],
    queryFn: queryFunction,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
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
