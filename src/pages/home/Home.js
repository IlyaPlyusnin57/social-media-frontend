import Topbar from "../../components/Topbar/Topbar";
import Leftbar from "../../components/Leftbar/Leftbar";
import "./home.scss";
import SmallChat from "../../components/Chat/SmallChat";
import useMediaQuery from "@mui/material/useMediaQuery";
<<<<<<< HEAD
=======
import { useAuth } from "../../context/AuthContext";
>>>>>>> f9066ce7b110d2089bdc7487915c3473d147c9fa

function Home({ children }) {
  const matchesMediaQuery = useMediaQuery("(min-width: 830px)");

  return (
    <>
      <Topbar />
      <div className="home">
        <div className="home-wrapper">
          {matchesMediaQuery && <Leftbar />}
          <section className="home-children-section">{children}</section>
        </div>
        {/* {matchesMediaQuery && <SmallChat />} */}
      </div>
    </>
  );
}

export default Home;
