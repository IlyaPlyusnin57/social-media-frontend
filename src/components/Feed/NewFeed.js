import "./Feed.scss";

import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getUsersFeedForADay } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { useRef, useState } from "react";
import Post from "./Timeline/Post";
import { useGetLastRef2 } from "../../hooks/useGetLastRef2";

function NewFeed() {
  const { user } = useAuth();
  const api = useAxiosConfig2();
  const [posts, setPosts] = useState([]);
  const [lastPostId, setLastPostId] = useState(null);

  const followIndex = useRef(0);
  const [userId, setUserId] = useState(user.following[followIndex]);

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
        currentUser.current.fetchNext = false;
      } else {
        followIndex.current++;

        if (followIndex.current % user.following.length === 0) {
          currentUser.current.currDay++;
          currentUser.current.prevDay++;
        }

        if (currentUser.current.prevDay === 4) {
          currentUser.current.hasFinished = true;
        } else {
          setUserId(
            user.following[followIndex.current % user.following.length]
          );
        }

        currentUser.current.lastPostId = null;
        currentUser.current.fetchNext = true;
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
    currentUser.current.fetchNext,
    currentUser.current.userId,
    setUserId,
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
          <main>{postContent}</main>
          {isLoading && <span>Loading...</span>}
          {isError && <span>Error: {error.message}</span>}
        </div>
      </div>
    </div>
  );
}

export default NewFeed;
