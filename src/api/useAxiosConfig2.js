import { isExpired } from "react-jwt";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken } from "../helper_functions/refreshToken";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const main_api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true,
});

export default function useAxiosConfig2() {
  const navigate = useNavigate();
  const { user, dispatch, socket } = useAuth();

  console.log({ useAxiosConfig: user });

  useEffect(() => {
    //main_api.defaults.headers = { authorization: `Bearer ${user.accessToken}` };

    const axiosInterceptor = main_api.interceptors.request.use(
      async (config) => {
        const accessToken = sessionStorage.getItem("accessToken");

        config.headers["Authorization"] = `Bearer ${accessToken}`;

        if (isExpired(accessToken)) {
          const token = await refreshToken(
            user,
            socket,
            dispatch,
            navigate,
            "useAxiosConfig2"
          );

          console.log({ RECEIVED_TOKEN: token });

          // dispatch({
          //   type: "UPDATE_TOKEN",
          //   payload: token.accessToken,
          // });

          sessionStorage.setItem("accessToken", token.accessToken);

          console.log("token has expired and has been updated!");

          config.headers["Authorization"] = `Bearer ${token.accessToken}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      main_api.interceptors.request.eject(axiosInterceptor);
    };
  }, [user, dispatch, navigate, socket]);

  return main_api;
}