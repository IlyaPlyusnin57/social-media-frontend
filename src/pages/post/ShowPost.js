import { useLocation } from "react-router-dom";
import { getPost } from "../../apiCalls";
import { useQuery } from "@tanstack/react-query";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { useState } from "react";
import Post from "../../components/Feed/Timeline/Post";

function ShowPost() {
  const { state: postId } = useLocation();
  const api = useAxiosConfig2();
  const [post, setPost] = useState([]);

  const { isLoading, isError, error } = useQuery({
    queryKey: [postId],
    queryFn: () => getPost(api, postId),
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setPost((prev) => [...prev, data]);
    },
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  const myPost = post.map((post) => {
    if (post == null) {
      return (
        <div key={"unique-key"} className="post">
          Post does not exist anymore
        </div>
      );
    }

    return <Post key={post._id} post={post} setPosts={setPost} />;
  });

  return myPost;
}

export default ShowPost;
