import "./SmallChat.scss";
import { Conversations } from "../../dummyData";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { useEffect, useState } from "react";

function SmallChat() {
  const [isCollapsed, setCollapsed] = useState(true);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  useEffect(() => {
    let chatArrow = document.querySelector(".chat-arrow");

    chatArrow.addEventListener("click", () => {
      setCollapsed((prevState) => !prevState);

      let tooltips = document.querySelectorAll(".tooltiptext");

      tooltips.forEach((el) => el.classList.toggle("show"));

      let userNames = document.querySelectorAll(".small-chat-user-name");

      userNames.forEach((element) => {
        const styles = getComputedStyle(element);
        if (styles.width === "0px") {
          element.style.paddingLeft = "8px";
          element.style.width = "100px";
        } else {
          element.style.paddingLeft = 0;
          element.style.width = "0px";
        }
      });
    });
  }, []);

  return (
    <>
      <div className="small-chat">
        <div className="chat-arrow">
          {isCollapsed ? (
            <KeyboardDoubleArrowLeftIcon />
          ) : (
            <KeyboardDoubleArrowRightIcon />
          )}
        </div>
        <div className="chat-users">
          {Conversations.map((item) => {
            return (
              <div className="small-chat-user tooltip" key={item.id}>
                <span className="tooltiptext">{item.username}</span>
                <img src={PF + item.profilePicture} alt="" />
                <span className="small-chat-user-name">{item.username}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default SmallChat;
