import Post from "./Post";
import { useCallback, useRef } from "react";
import usePosts from "../../../api/usePosts";

function Posts({ profile, api, currentUser, profile_picture }) {
  const {
    status,
    error,
    isFetching,
    posts,
    setPosts,
    hasNextPage,
    setLastPostId,
    nextPostId,
  } = usePosts(profile, api, currentUser);

  const intObserver = useRef();

  const lastPostRef = useCallback(
    (post) => {
      if (isFetching) return;

      if (intObserver.current) intObserver.current.disconnect();

      intObserver.current = new IntersectionObserver((posts) => {
        if (posts[0].isIntersecting && hasNextPage) {
          console.log("We are near the last post");
          if (nextPostId.current) setLastPostId(nextPostId.current);
          //intObserver.current.unobserve(post);
        }
      });

      if (post) intObserver.current.observe(post);
    },
    [isFetching, hasNextPage, setLastPostId, nextPostId]
  );

  if (status === "loading") {
    return <span>Loading...</span>;
  }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  const postContent = posts?.map((post, i) => {
    if (posts.length - 1 === i) {
      return (
        <Post
          ref={lastPostRef}
          key={post._id}
          post={post}
          user={currentUser}
          profile_picture={profile_picture}
          setPosts={setPosts}
        />
      );
    }

    return (
      <Post
        key={post._id}
        post={post}
        user={currentUser}
        profile_picture={profile_picture}
        setPosts={setPosts}
      />
    );
  });

  return <div className="posts">{postContent}</div>;
}

export default Posts;
