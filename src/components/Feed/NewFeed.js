import "./Feed.scss";

import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getUsersFeedForADay } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { useRef } from "react";
import Post from "./Timeline/Post";

function NewFeed() {
  const { user } = useAuth();
  const api = useAxiosConfig2();

  const currentUser = useRef({
    userId: user.following[0],
    currDay: 0,
    prevDay: 1,
  });

  const {
    isLoading,
    isError,
    data: posts,
    error,
  } = useQuery({
    queryKey: ["user-feed-for-a-day", currentUser.current.userId],
    queryFn: () =>
      getUsersFeedForADay(api, currentUser.current.userId, {
        currDay: currentUser.current.currDay,
        prevDay: currentUser.current.prevDay,
      }),
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  const postContent = posts.map((post) => {
    return <Post key={post._id} post={post} />;
  });

  return (
    <div className="feed">
      <div className="timeline">
        <div className="timeline-main">
          <main>{postContent}</main>
        </div>
      </div>
    </div>
  );
}

export default NewFeed;
