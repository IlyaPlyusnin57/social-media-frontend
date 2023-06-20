import "./Subscriptions.scss";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import profilePicture from "../../../helper_functions/profilePicture";
import { getSubs } from "../../../apiCalls";
import useAxiosConfig from "../../../api/useAxiosConfig";
import { memo } from "react";
import { useAuth } from "../../../context/AuthContext";

const Subscriptions = memo(({ user }) => {
  const navigate = useNavigate();

  const { user: currentUser, dispatch, socket } = useAuth();

  const api = useAxiosConfig(currentUser, dispatch, socket);

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

  return (
    <div className="subs">
      <h4>Subscriptions</h4>

      {followingArr?.map((user, i) => {
        const profile_picture = profilePicture(user);

        return (
          <div key={i} className="sub-image">
            <img
              onClick={() => handleSearchUser(user)}
              src={profile_picture}
              alt=""
            />
            <div style={{ fontSize: "10px" }}>
              {user?.first_name + " " + user?.last_name}
            </div>
          </div>
        );
      })}
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
