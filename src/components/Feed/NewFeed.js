import "./Feed.scss";

import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getUsersFeedForADay } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { useRef, useState } from "react";
import Post from "./Timeline/Post";
import { useGetLastRef2 } from "../../hooks/useGetLastRef2";
import UsersPosts from "./UsersPosts";

function NewFeed() {
  const { user } = useAuth();
  const api = useAxiosConfig2();
  const [posts, setPosts] = useState([]);
  const [lastPostId, setLastPostId] = useState(null);

  const followIndex = useRef(0);
  const [userId, setUserId] = useState(true);

  const currentUser = useRef({
    userId: user.following[followIndex.current],
    currDay: 0,
    prevDay: 1,
    lastPostId: null,
    fetchNext: false,
    hasFinished: false,
  });

  const { isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["user-feed-for-a-day", lastPostId, userId],
    refetchOnWindowFocus: false,
    queryFn: () =>
      getUsersFeedForADay(api, currentUser.current.userId, {
        currDay: currentUser.current.currDay,
        prevDay: currentUser.current.prevDay,
        lastPostId: currentUser.current.lastPostId,
      }),
    onSuccess: (data) => {
      if (data.length === 10) {
        currentUser.current.lastPostId = data[data.length - 1]._id;
      } else {
        followIndex.current++;

        if (followIndex.current % user.following.length === 0) {
          currentUser.current.currDay++;
          currentUser.current.prevDay++;
        }

        if (currentUser.current.prevDay === 5) {
          currentUser.current.hasFinished = true;
        } else {
          setUserId((prev) => !prev);
        }

        currentUser.current.lastPostId = null;
        currentUser.current.userId =
          user.following[followIndex.current % user.following.length];
      }

      setPosts((prev) => [...prev, ...data]);
    },
  });

  const lastPostRef = useGetLastRef2(
    isFetching,
    currentUser.current.lastPostId,
    setLastPostId,
    currentUser.current.hasFinished
  );

  const postContent = posts.map((post, i, postArray) => {
    return (
      <Post
        key={post._id}
        post={post}
        ref={i === postArray.length - 1 ? lastPostRef : null}
      />
    );
  });

  return (
    <div className="feed">
      <div className="timeline">
        <div className="timeline-main">
          {<UsersPosts />}
          <main>{postContent}</main>
          {isLoading && <span>Loading...</span>}
          {isError && <span>Error: {error.message}</span>}
          {currentUser.current.hasFinished && (
            <div className="post" style={{ textAlign: "center" }}>
              You have seen all posts from past 3 days
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewFeed;
