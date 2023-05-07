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
  const [nameResults, setNameResults] = useState([]);

  useEffect(() => {
    const getNames = async () => {
      const res = await axios.post("/users/search", { name: searchQuery });
      setNameResults(res.data);
    };

    getNames();
  }, [searchQuery]);

  function handleSearchUser(user) {
    navigate("/search-profile", { state: user });
  }

  return (
    <div className="search-results">
      {nameResults.map((user, i) => {
        const profile_picture = profilePicture(user);

        return (
          <div className="search-results-names" key={i}>
            <OnlineUser profilePicture={profile_picture} userId={user._id} />
            {/* <div className="user-name">{user.full_name}</div> */}
            <div className="user-name">{user.username}</div>
            <p onClick={() => handleSearchUser(user)} className="link-styling">
              View Page
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default SearchResults;
