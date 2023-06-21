import { refresh_api } from "../api/axiosDefaultSettings";
import { handleLogout } from "../apiCalls";

export async function refreshToken(user, socket, dispatch, navigate) {
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
