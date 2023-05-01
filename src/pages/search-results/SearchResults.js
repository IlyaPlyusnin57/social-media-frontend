import { useLocation } from "react-router-dom";
import "./SearchResults.scss";
import "../../components/Feed/Feed.scss";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import profilePicture from "../../helper_functions/profilePicture";

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
            <div className="user-image">
              {<img src={profile_picture} alt="" />}
            </div>
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
