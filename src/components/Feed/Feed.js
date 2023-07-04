import "./Feed.scss";

import Header from "./Timeline/Header";
import NewPost from "./Timeline/NewPost";
import Followers from "./Timeline/Followers";
import Subs from "./Timeline/Subscriptions";
import Post from "../../components/Feed/Timeline/Post";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import profilePicture from "../../helper_functions/profilePicture";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import useMediaQuery from "@mui/material/useMediaQuery";
import usePosts from "../../api/usePosts";
import { useGetLastRef } from "../../hooks/useGetLastRef";

function Feed({ profile }) {
  const matchesMediaQuery = useMediaQuery("(min-width: 440px)");
  const { state: searchedUser } = useLocation();
  const [parent] = useAutoAnimate();

  let { user, profile_picture } = useAuth();

  const api = useAxiosConfig2();

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
        user={currentUser}
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
            <Followers user={currentUser} />
            <Subs user={currentUser} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
