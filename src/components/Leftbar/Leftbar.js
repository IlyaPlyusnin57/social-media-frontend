import "./Leftbar.scss";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import ChatIcon from "@mui/icons-material/Chat";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PeopleIcon from "@mui/icons-material/People";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";

function LeftBar() {
  const { username } = useAuth().user;

  return (
    <div className="leftbar">
      <ul className="icon-list">
        <Link to={`/profile/${username}`}>
          <li>
            <AccountCircleIcon className="leftbar-icon" />
            My Page
          </li>
        </Link>
        <Link to="/">
          <li>
            <RssFeedIcon className="leftbar-icon" />
            Feed
          </li>
        </Link>
        <Link to="/chats">
          <li>
            <ChatIcon className="leftbar-icon" />
            Chats
          </li>
        </Link>
        <Link to="/subs">
          <li>
            <PeopleIcon className="leftbar-icon" />
            Subs
          </li>
        </Link>

        <Link to="/followers">
          <li>
            <PeopleIcon className="leftbar-icon" />
            Followers
          </li>
        </Link>

        <Link to="/tags">
          <li>
            <AlternateEmailIcon className="leftbar-icon" />
            Tags
          </li>
        </Link>

        {/* <li>
          <PlayCircleIcon className="leftbar-icon" />
          Videos
        </li>
        <li>
          <GroupsIcon className="leftbar-icon" />
          Groups
        </li>
        <li>
          <BookmarksIcon className="leftbar-icon" />
          Bookmarks
        </li> */}
      </ul>
    </div>
  );
}

export default LeftBar;
