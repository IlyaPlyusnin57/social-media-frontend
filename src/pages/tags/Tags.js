import { getTaggedPosts } from "../../apiCalls";
import { useQuery } from "@tanstack/react-query";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import Post from "../../components/Feed/Timeline/Post";

function Tags() {
  const { user } = useAuth();
  const api = useAxiosConfig2();

  const [posts, setPosts] = useState([]);

  console.log({ posts });

  useQuery({
    queryFn: () => getTaggedPosts(api, user._id),
    queryKey: [user._id],
    refetchOnWindowFocus: false,
    onSuccess: (posts) => {
      setPosts(posts);
    },
  });

  const postContent = posts.map((post) => {
    return <Post key={post._id} post={post} user={user} setPosts={setPosts} />;
  });

  return <div>{postContent}</div>;
}

export default Tags;
