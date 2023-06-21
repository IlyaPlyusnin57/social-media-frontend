import { isExpired } from "react-jwt";
import { useEffect } from "react";
import { handleLogout } from "../apiCalls";
import { refresh_api, main_api } from "./axiosDefaultSettings";
import { useNavigate } from "react-router-dom";

async function refreshToken(user, socket, dispatch, navigate) {
  console.log({ userInRefreshToken: user });

  try {
    const res = await refresh_api.post("/auth/refresh", {
      userId: user._id,
    });
    return res.data;
  } catch (error) {
    console.log({ refreshTokenError: error });
    if (error?.response?.status === 403) {
      handleLogout(socket, dispatch, navigate);
    }
  }
}

export default function useAxiosConfig(user, dispatch, socket) {
  const navigate = useNavigate();

  console.log({ useAxiosConfig: user });

  useEffect(() => {
    if (!user || !socket) return;
    //main_api.defaults.headers = { authorization: `Bearer ${user.accessToken}` };

    const axiosInterceptor = main_api.interceptors.request.use(
      async (config) => {
        config.headers["Authorization"] = `Bearer ${user.accessToken}`;

        if (isExpired(user.accessToken)) {
          const token = await refreshToken(user, socket, dispatch, navigate);

          console.log({ RECEIVED_TOKEN: token });

          dispatch({
            type: "UPDATE_TOKEN",
            payload: token.accessToken,
          });

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
