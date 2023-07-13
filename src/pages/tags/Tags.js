import { getTaggedPosts } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { useAuth } from "../../context/AuthContext";
import { useState, useCallback } from "react";
import Post from "../../components/Feed/Timeline/Post";
import usePosts3 from "../../api/usePosts3";
import { useGetLastRef } from "../../hooks/useGetLastRef";

import "./Tags.scss";

function Tags() {
  const { user } = useAuth();
  const api = useAxiosConfig2();
  const [lastPostId, setLastPostId] = useState(null);

  const queryFunction = useCallback(
    () =>
      getTaggedPosts(api, user._id, {
        lastPostId,
      }),
    [api, user._id, lastPostId]
  );

  const {
    isError,
    error,
    isFetching,
    posts,
    setPosts,
    hasNextPage,
    nextPostId,
  } = usePosts3(user, lastPostId, queryFunction);

  const lastPostRef = useGetLastRef(
    isFetching,
    hasNextPage,
    nextPostId,
    setLastPostId
  );

  const postContent = posts?.map((post, i, postArray) => {
    return (
      <Post
        ref={i === postArray.length - 1 ? lastPostRef : null}
        key={post._id}
        post={post}
        user={user}
        setPosts={setPosts}
      />
    );
  });

  return (
    <section className="tags-container">
      <div className="post-list-container">
        <div className="post-list">{postContent}</div>
        {isFetching && <p className="center">Loading More Posts...</p>}
        {isError && <span>Error: {error.message}</span>}
      </div>
    </section>
  );
}

export default Tags;
