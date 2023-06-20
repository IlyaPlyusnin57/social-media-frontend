import { isExpired } from "react-jwt";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../apiCalls";

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
axios.defaults.withCredentials = true;

const refresh_api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true,
});

const main_api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true,
});

async function refreshToken(user, socket, dispatch, navigate) {
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

export default function useAxiosConfig() {
  const { user, dispatch, socket } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    //main_api.defaults.headers = { authorization: `Bearer ${user.accessToken}` };

    const axiosInterceptor = main_api.interceptors.request.use(
      async (config) => {
        config.headers["Authorization"] = `Bearer ${user.accessToken}`;

        if (isExpired(user.accessToken)) {
          const token = await refreshToken(user, socket, dispatch, navigate);
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
