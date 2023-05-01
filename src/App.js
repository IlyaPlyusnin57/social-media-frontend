import Home from "./pages/home/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./pages/ProtectedRoute";
import SearchResults from "./pages/search-results/SearchResults";
import Feed from "./components/Feed/Feed";
import ChatList from "./pages/chats/ChatList";
import Conversation from "./components/Chat/Conversation";
import SubList from "./pages/subs/SubList";

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
                <Feed profile={false} />
              </Home>
            }
          ></Route>
          <Route
            path="/profile/:username"
            element={
              <Home>
                <Feed profile={true} />
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
                <Feed profile={true} />
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
                <SubList />
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
        </Route>
      </Routes>
    </>
  );
}

export default App;
