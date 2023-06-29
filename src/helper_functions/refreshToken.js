import { refresh_api } from "../api/axiosDefaultSettings";
import { handleLogout } from "../apiCalls";

export async function refreshToken(user, socket, dispatch, navigate) {
  try {
    const res = await refresh_api.post("/auth/refresh", {
      userId: user._id,
    });
    return res.data;
  } catch (error) {
    console.log({ refreshTokenError: error });
    const status = error?.response?.status;

    if (status === 403 || status === 401) {
      handleLogout(socket, dispatch, navigate);
    }
  }
}
