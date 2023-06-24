import SearchIcon from "@mui/icons-material/Search";

function SearchBar({ searchBar, handleSearch }) {
  return (
    <div className="search-bar">
      <SearchIcon className="search-icon" />
      <input
        type="text"
        placeholder="Search for friend"
        ref={searchBar}
        onChange={handleSearch}
      />
    </div>
  );
}

export default SearchBar;
