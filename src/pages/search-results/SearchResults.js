import { useLocation } from "react-router-dom";
import "./SearchResults.scss";
import "../../components/Feed/Feed.scss";

import { useNavigate } from "react-router-dom";
import { useState, useCallback, useRef, useEffect } from "react";
import profilePicture from "../../helper_functions/profilePicture";
import { searchAllUsers } from "../../apiCalls";
import DisplayUser from "../../components/DisplayUser/DisplayUser";
import { useGetLastRef } from "../../hooks/useGetLastRef";
import { useNextQuery } from "../../hooks/useNextQuery";
import useMediaQuery from "@mui/material/useMediaQuery";

function SearchResults() {
  const { state: searchQuery } = useLocation();
  const [search, setSearch] = useState(searchQuery);

  const ref = useRef(null);
  const navigate = useNavigate();
  const [lastUserId, setLastUserId] = useState(null);
  const matches478 = useMediaQuery("(max-width: 478px)");

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  function handleInputOnChange() {
    setSearch(ref.current.value);
  }

  const {
    isError,
    error,
    isFetching,
    results: nameResults,
    hasNextPage,
    nextUserId,
  } = useNextQuery(["searchAllUsers", search, lastUserId], searchAllUsers, {
    name: search,
    lastUserId,
  });

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
      {matches478 && (
        <input
          type="text"
          className="search-input"
          defaultValue={search}
          onChange={handleInputOnChange}
          placeholder="Search for friends"
          ref={ref}
        />
      )}
      {userResults}
      {isFetching && <p>Loading More Posts...</p>}
      {isError && <span>Error: {error.message}</span>}
    </div>
  );
}

export default SearchResults;
