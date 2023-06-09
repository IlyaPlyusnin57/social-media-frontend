import "./Subscriptions.scss";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import profilePicture from "../../../helper_functions/profilePicture";
import { getSubs } from "../../../apiCalls";
import useAxiosConfig2 from "../../../api/useAxiosConfig2";
import { memo, useState } from "react";
import LikerListModal from "../../LikerList/LikerListModal";
import { createPortal } from "react-dom";

const Subscriptions = memo(({ user }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const api = useAxiosConfig2();

  function handleSearchUser(user) {
    navigate("/search-profile", { state: user });
  }

  const {
    data: followingArr,
    status,
    error,
  } = useQuery({
    queryKey: ["followingUsers", user],
    queryFn: () => getSubs(api, user),
    refetchOnWindowFocus: false,
  });

  if (status === "loading") {
    return <span>Loading...</span>;
  }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  const shortFollowingArr = followingArr.slice(0, 3);

  if (shortFollowingArr.length === 0) {
    return;
  }

  const userName = "Subscriber";
  const message = "";

  return (
    <div className="subs">
      <h4>Subscriptions</h4>
      {shortFollowingArr?.map((user, i) => {
        const profile_picture = profilePicture(user);

        return (
          <div
            key={i}
            className="sub-image pointer"
            onClick={() => handleSearchUser(user)}
          >
            <img src={profile_picture} alt="" />
            <div style={{ fontSize: "10px" }} className="sub-user-name">
              {user?.first_name}
            </div>
          </div>
        );
      })}
      <div className="view-all pointer" onClick={() => setShowModal(true)}>
        View All
      </div>
      {showModal &&
        createPortal(
          <LikerListModal
            {...{
              userList: followingArr,
              message,
              userName,
              removeModal: () => setShowModal(false),
            }}
          />,
          document.body
        )}
    </div>
  );
});

// function Subscriptions({ user }) {
//   const navigate = useNavigate();
//   const api = useAxiosConfig();

//   function handleSearchUser(user) {
//     navigate("/search-profile", { state: user });
//   }

//   const {
//     data: followingArr,
//     status,
//     error,
//   } = useQuery({
//     queryKey: ["followingUsers", user],
//     queryFn: () => getSubs(api, user),
//     refetchOnWindowFocus: false,
//   });

//   if (status === "loading") {
//     return <span>Loading...</span>;
//   }

//   if (status === "error") {
//     return <span>Error: {error.message}</span>;
//   }

//   return (
//     <div className="subs">
//       <h4>Subscriptions</h4>

//       {followingArr.map((user, i) => {
//         const profile_picture = profilePicture(user);

//         return (
//           <div key={i} className="sub-image">
//             <img
//               onClick={() => handleSearchUser(user)}
//               src={profile_picture}
//               alt=""
//             />
//             <div style={{ fontSize: "10px" }}>
//               {user.first_name + " " + user.last_name}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

export default Subscriptions;
