import { useLocation } from "react-router-dom";
import "./SearchResults.scss";
import "../../components/Feed/Feed.scss";

import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import profilePicture from "../../helper_functions/profilePicture";
import { searchAllUsers } from "../../apiCalls";
import DisplayUser from "../../components/DisplayUser/DisplayUser";
import { useGetLastRef } from "../../hooks/useGetLastRef";
import { useNextQuery } from "../../hooks/useNextQuery";

function SearchResults() {
  const { state: searchQuery } = useLocation();
  const navigate = useNavigate();
  const [lastUserId, setLastUserId] = useState(null);

  const {
    isError,
    error,
    isFetching,
    results: nameResults,
    hasNextPage,
    nextUserId,
  } = useNextQuery(
    ["searchAllUsers", searchQuery, lastUserId],
    searchAllUsers,
    { name: searchQuery, lastUserId }
  );

  const lastUserRef = useGetLastRef(
    isFetching,
    hasNextPage,
    nextUserId,
    setLastUserId
  );

  const handleSearchUser = useCallback(
    (user) => {
      navigate("/search-profile", { state: user });
    },
    [navigate]
  );

  const userResults = nameResults.map((user, i, nameArray) => {
    return (
      <DisplayUser
        ref={i === nameArray.length - 1 ? lastUserRef : null}
        key={user._id}
        profile_picture={profilePicture(user)}
        user={user}
        handleSearchUser={handleSearchUser}
      />
    );
  });

  return (
    <div className="search-results">
      {userResults}
      {isFetching && <p>Loading More Posts...</p>}
      {isError && <span>Error: {error.message}</span>}
    </div>
  );
}

export default SearchResults;
