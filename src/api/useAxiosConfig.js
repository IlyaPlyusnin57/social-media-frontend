import { isExpired } from "react-jwt";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { refreshToken } from "../helper_functions/refreshToken";
import { main_api } from "./axiosDefaultSettings";

export default function useAxiosConfig(user, dispatch, socket) {
  const navigate = useNavigate();

  useEffect(() => {
    //main_api.defaults.headers = { authorization: `Bearer ${user.accessToken}` };

    const axiosInterceptor = main_api.interceptors.request.use(
      async (config) => {
        const accessToken = sessionStorage.getItem("accessToken");

        config.headers["Authorization"] = `Bearer ${accessToken}`;

        if (isExpired(accessToken)) {
          const token = await refreshToken(user, socket, dispatch, navigate);

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
