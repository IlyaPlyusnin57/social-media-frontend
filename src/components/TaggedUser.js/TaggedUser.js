import { useNavigate } from "react-router-dom";
import { getUser2 } from "../../apiCalls";
import "./TaggedUser.scss";

function TaggedUser({ contentArr, api }) {
  const navigate = useNavigate();

  function navigateToUser(user) {
    navigate("/search-profile", { state: user });
  }

  return (
    <>
      {contentArr.map((word, index) => {
        if (word[0] === "@") {
          return (
            <span
              key={index}
              className="tagged-user"
              onClick={async () => {
                const user = await getUser2(api, word.substring(1));
                navigateToUser(user);
              }}
            >
              {word}
            </span>
          );
        }

        return " " + word;
      })}
    </>
  );
}

export default TaggedUser;
