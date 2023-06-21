import axios from "axios";
import CryptoJS from "crypto-js";

export async function loginCall(userCredentials, dispatch) {
  dispatch({ type: "LOGIN_START" });

  try {
    const res = await axios.post("/auth/login", userCredentials);
    const { password, ...new_user } = res.data;
    dispatch({ type: "LOGIN_SUCCESS", payload: new_user });

    sessionStorage.setItem("accessToken", new_user.accessToken);

    return res;
  } catch (error) {
    dispatch({ type: "LOGIN_FAILURE", payload: error.response.data });
    return error;
  }
}

async function logoutCall(dispatch) {
  try {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    await axios.post("/auth/logout");
    dispatch({ type: "LOGOUT" });
  } catch (error) {
    console.log(error);
    return error;
  }
}

export function handleLogout(socket, dispatch, navigate) {
  socket?.emit("manualDisconnect");
  logoutCall(dispatch);
  navigate("/login", { replace: true });
}

export async function register_user(userInfo, dispatch) {
  dispatch({ type: "REGISTER_START" });

  try {
    const res = await axios.post("/auth/register", userInfo);
    const { password, ...new_user } = res.data;
    dispatch({ type: "REGISTER_SUCCESS", payload: new_user });
    return res;
  } catch (error) {
    dispatch({ type: "SET_ERROR", payload: error.response.data });
    return error;
  }
}

export async function getSubs(api, user) {
  try {
    const res = await api.get(`/users/${user._id}/subscriptions`);
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getFeedOrPage(api, url, options = {}) {
  try {
    const res = await api.get(url, options);
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getPaginatedFeed(api, url, options = {}) {
  try {
    const res = await api.post(url, options);

    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getConversations(api, user) {
  try {
    const res = await api.get(`/conversations/${user._id}`);
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getUser(api, friendId) {
  try {
    const res = await api.get(`/users/${friendId}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getConversation(api, userId, friendId) {
  try {
    const res = await api.get(`conversations/${userId}/${friendId}`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function createConversation(api, options = {}) {
  try {
    const res = await api.post("/conversations", options);
    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getMessages(api, conversation, options = {}) {
  try {
    const res = await api.post(`/messages/${conversation?._id}`, options);
    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function searchAllUsers(api, options = {}) {
  try {
    const res = await api.post("/users/searchAllUsers", options);

    return res.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function sendMessagetoUser(
  api,
  senderId,
  message,
  conversationId,
  receiverId
) {
  try {
    const enryptedMessage = CryptoJS.AES.encrypt(
      message,
      process.env.REACT_APP_MESSAGE_SECRET
    ).toString();

    const res = await api.post("/messages", {
      senderId,
      message: enryptedMessage,
      conversationId,
      receiverId,
    });

    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function searchUsers(api, name) {
  try {
    const res = await api.post("/users/search", { name });

    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getNotifications(api, userId) {
  try {
    const res = await api.get(`/notifications/${userId}`);

    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getFollowingStatus(api, user, currentUser) {
  try {
    const res = await api.post(`users/${user._id}/is-following`, {
      id: currentUser._id,
    });

    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function followUser(api, user, currentUser, refetch, socket) {
  try {
    const res = await api.patch(`/users/${user._id}/follow`, {
      userId: currentUser._id,
    });

    if (res?.status === 200) {
      console.log({ res });
      socket?.emit("sendFollow", res.data);
    }

    refetch();
  } catch (error) {
    console.log(error);
  }
}

export async function unfollowUser(api, user, currentUser, refetch) {
  try {
    await api.patch(`/users/${user._id}/unfollow`, {
      userId: currentUser._id,
    });

    refetch();
  } catch (error) {
    console.log(error);
  }
}

export async function removeNotification(api, userId, options = {}) {
  try {
    console.log({ api, userId, options });

    const res = await api.patch(`/notifications/${userId}`, options);

    return res.data;
  } catch (error) {
    console.log(error);
  }
}
