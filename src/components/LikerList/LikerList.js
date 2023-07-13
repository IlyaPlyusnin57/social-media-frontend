import { useQuery } from "@tanstack/react-query";
import { getPostLikers } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import { useState } from "react";
import { createPortal } from "react-dom";
import LikerListModal from "./LikerListModal";
import "./LikerList.scss";

function ShowContent({ isLoading, userList, setListModal }) {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div onClick={() => setListModal(true)} className="pointer">
      Liked by {userList?.length} {userList?.length === 1 ? "user" : "users"}
    </div>
  );
}

function LikedList({ removeDisplay, post }) {
  const api = useAxiosConfig2();
  const [listModal, setListModal] = useState(false);

  const {
    data: userList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["liker-list", post._id],
    queryFn: () => getPostLikers(api, post._id),
  });

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  const userName = "user";
  const message = "liked your post";

  return (
    <section id="liker-list-container" onMouseLeave={removeDisplay}>
      <ShowContent {...{ isLoading, userList, setListModal }} />

      {listModal &&
        createPortal(
          <LikerListModal
            {...{
              userList,
              message,
              removeModal: () => {
                setListModal(false);
                removeDisplay();
              },
              userName,
            }}
          />,
          document.body
        )}
    </section>
  );
}

export default LikedList;
