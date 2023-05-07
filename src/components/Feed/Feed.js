import "./Feed.scss";

import Header from "./Timeline/Header";
import NewPost from "./Timeline/NewPost";
import Followers from "./Timeline/Followers";
import Subs from "./Timeline/Subscriptions";
import Post from "../../components/Feed/Timeline/Post";
import { useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import profilePicture from "../../helper_functions/profilePicture";
import useAxiosConfig from "../../api/useAxiosConfig";
import useMediaQuery from "@mui/material/useMediaQuery";
import usePosts from "../../api/usePosts";

function Feed({ profile }) {
  const api = useAxiosConfig();
  const matchesMediaQuery = useMediaQuery("(min-width: 440px)");
  const { state: searchedUser } = useLocation();
  const [parent] = useAutoAnimate();

  let { user, profile_picture } = useAuth();
  let currentUser = user;

  if (searchedUser) {
    currentUser = searchedUser;
    profile_picture = profilePicture(currentUser);
  }

  const displayNewPost = currentUser?._id === user._id;

  const {
    isError,
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
        }
      });

      if (post) intObserver.current.observe(post);
    },
    [isFetching, hasNextPage, setLastPostId, nextPostId]
  );

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

  return (
    <div className="feed">
      {profile && (
        <Header user={currentUser} profile_picture={profile_picture} />
      )}

      <div className="timeline">
        <div className="timeline-main">
          {displayNewPost && <NewPost setPosts={setPosts} />}
          <main ref={parent}>{postContent}</main>
          {isFetching && <p className="center">Loading More Posts...</p>}
          {isError && <span>Error: {error.message}</span>}
        </div>

        {profile && matchesMediaQuery && (
          <div className="timeline-right">
            <Followers />
            <Subs user={currentUser} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
