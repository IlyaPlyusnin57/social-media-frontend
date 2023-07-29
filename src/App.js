import Home from "./pages/home/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./pages/ProtectedRoute";
import SearchResults from "./pages/search-results/SearchResults";
import Feed from "./components/Feed/Feed";
import ChatList from "./pages/chats/ChatList";
import Conversation from "./components/Chat/Conversation";
import UserList from "./pages/users/UserList";
import ShowPost from "./pages/post/ShowPost";
import NewFeed from "./components/Feed/NewFeed";
import Tags from "./pages/tags/Tags";

import { getSubs, getFollowers } from "./apiCalls";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Home>
                <NewFeed />
              </Home>
            }
          ></Route>
          <Route
            path="/profile/:username"
            element={
              <Home>
                <Feed profile={true} search={false} />
              </Home>
            }
          ></Route>
          <Route
            path="/search-results"
            element={
              <Home>
                <SearchResults />
              </Home>
            }
          ></Route>
          <Route
            path="/search-profile"
            element={
              <Home>
                <Feed profile={true} search={true} />
              </Home>
            }
          ></Route>
          <Route
            path="/chats"
            element={
              <Home>
                <ChatList />
              </Home>
            }
          ></Route>
          <Route
            path="/subs"
            element={
              <Home>
                <UserList queryFunction={getSubs} queryKey={"subs"} />
              </Home>
            }
          ></Route>
          <Route
            path="/followers"
            element={
              <Home>
                <UserList queryFunction={getFollowers} queryKey={"followers"} />
              </Home>
            }
          ></Route>
          <Route
            path="/conversation"
            element={
              <Home>
                <Conversation />
              </Home>
            }
          ></Route>
          <Route
            path="/post"
            element={
              <Home>
                <ShowPost />
              </Home>
            }
          ></Route>
          <Route
            path="/tags"
            element={
              <Home>
                <Tags />
              </Home>
            }
          ></Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
