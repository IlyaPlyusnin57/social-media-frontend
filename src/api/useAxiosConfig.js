import { isExpired } from "react-jwt";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

axios.defaults.baseURL =
  "https://https://social-media-backend-virid.vercel.app/:8800/api";
axios.defaults.withCredentials = true;

const refresh_api = axios.create({
  baseURL: "https://https://social-media-backend-virid.vercel.app/:8800/api",
  withCredentials: true,
});

const main_api = axios.create({
  baseURL: "https://https://social-media-backend-virid.vercel.app/:8800/api",
  withCredentials: true,
});

async function refreshToken(user) {
  try {
    const res = await refresh_api.post("/auth/refresh", {
      userId: user._id,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export default function useAxiosConfig() {
  const { user, dispatch } = useAuth();

  useEffect(() => {
    //main_api.defaults.headers = { authorization: `Bearer ${user.accessToken}` };

    const axiosInterceptor = main_api.interceptors.request.use(
      async (config) => {
        config.headers["Authorization"] = `Bearer ${user.accessToken}`;

        if (isExpired(user.accessToken)) {
          const token = await refreshToken(user);
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
  }, [user, dispatch]);

  return main_api;
}
