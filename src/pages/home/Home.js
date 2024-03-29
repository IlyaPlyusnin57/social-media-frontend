import Topbar from "../../components/Topbar/Topbar";
import Leftbar from "../../components/Leftbar/Leftbar";
import "./home.scss";
import SmallChat from "../../components/Chat/SmallChat";
import useMediaQuery from "@mui/material/useMediaQuery";

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
