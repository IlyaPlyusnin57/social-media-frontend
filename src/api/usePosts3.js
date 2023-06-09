import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

function usePosts3(user, lastPostId, queryFunction) {
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
      hasNextPage.current = data.length === 10;
      nextPostId.current =
        data.length === 10 ? data[data.length - 1]._id : null;
    },
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
