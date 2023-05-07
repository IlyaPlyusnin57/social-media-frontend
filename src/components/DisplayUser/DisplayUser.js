import OnlineUser from "../Online User/OnlineUser";
import { forwardRef, memo } from "react";

const DisplayUser = memo(
  forwardRef(function DisplayUser(
    { profile_picture, user, handleSearchUser },
    ref
  ) {
    return (
      <div className="search-results-names" ref={ref}>
        <OnlineUser profilePicture={profile_picture} userId={user._id} />
        <div className="user-name">{user.username}</div>
        <p onClick={() => handleSearchUser(user)} className="link-styling">
          View Page
        </p>
      </div>
    );
  })
);

// function DisplayUser({ profile_picture, user, handleSearchUser }) {
//   return (
//     <div className="search-results-names">
//       <OnlineUser profilePicture={profile_picture} userId={user._id} />
//       {/* <div className="user-name">{user.first_name + " " + user.last_name}</div> */}
//       <div className="user-name">{user.username}</div>
//       <p onClick={() => handleSearchUser(user)} className="link-styling">
//         View Page
//       </p>
//     </div>
//   );
// }

export default DisplayUser;
