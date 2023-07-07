import { useQuery } from "@tanstack/react-query";
import { getUsersFeedForADay } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { useAuth } from "../../context/AuthContext";
import Post from "./Timeline/Post";
import { useState } from "react";
import NewPost from "./Timeline/NewPost";

function UsersPosts() {
  const api = useAxiosConfig2();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);

  const { isLoading, isError, error } = useQuery({
    queryKey: ["usersposts"],
    queryFn: () =>
      getUsersFeedForADay(api, user._id, {
        currDay: 0,
        prevDay: 1,
        lastPostId: null,
      }),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setPosts(data);
    },
  });

  const postContent = posts.map((post) => {
    return <Post key={post._id} post={post} setPosts={setPosts} />;
  });

  return (
    <>
      <NewPost setPosts={setPosts} />
      {isLoading && <span>Loading...</span>}
      {isError && <span>Error: {error.message}</span>}
      {postContent}
    </>
  );
}

export default UsersPosts;
