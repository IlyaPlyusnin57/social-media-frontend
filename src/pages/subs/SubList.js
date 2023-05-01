import "./SubList.scss";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { getSubs } from "../../apiCalls";
import useAxiosConfig from "../../api/useAxiosConfig";
import UnknowUser from "../../components/Helpers/UnknownUser";

import Sub from "./Sub";

function SubList() {
  const { user } = useAuth();
  const api = useAxiosConfig();

  const {
    status,
    data: subs,
    error,
  } = useQuery({
    queryKey: ["subs"],
    queryFn: () => getSubs(api, user),
    refetchOnWindowFocus: false,
  });

  if (status === "loading") {
    return <span>Loading...</span>;
  }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  console.log({ subAre: subs });

  return (
    <div className="sub-container">
      {subs.map((sub, i) => {
        if (!sub)
          return <UnknowUser key={i} message={"User does not exist anymore"} />;
        return <Sub key={sub?._id} friend={sub} />;
      })}
    </div>
  );
}

export default SubList;
