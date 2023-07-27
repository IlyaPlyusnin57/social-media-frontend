import "./UserList.scss";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { getSubs } from "../../apiCalls";
import useAxiosConfig2 from "../../api/useAxiosConfig2";
import UnknownUser from "../../components/Helpers/UnknownUser";

import User from "./User";

function UserList() {
  const { user: currentUser } = useAuth();
  const api = useAxiosConfig2();

  const {
    status,
    data: users,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => getSubs(api, currentUser),
    refetchOnWindowFocus: false,
  });

  if (status === "loading") {
    return <span>Loading...</span>;
  }

  if (status === "error") {
    return <span>Error: {error.message}</span>;
  }

  return (
    <div className="sub-container">
      {users.map((user, i) => {
        if (!user)
          return (
            <UnknownUser key={i} message={"User does not exist anymore"} />
          );
        return <User key={user?._id} friend={user} />;
      })}
    </div>
  );
}

export default UserList;
