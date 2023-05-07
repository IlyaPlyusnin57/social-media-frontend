import axios from "axios";

export async function loginCall(userCredentials, dispatch) {
  dispatch({ type: "LOGIN_START" });

  try {
    const res = await axios.post("/auth/login", userCredentials);
    const { password, ...new_user } = res.data;
    sessionStorage.setItem("token", res.data.accessToken);
    dispatch({ type: "LOGIN_SUCCESS", payload: new_user });
    return res;
  } catch (error) {
    dispatch({ type: "LOGIN_FAILURE", payload: error.response.data });
    return error;
  }
}

export async function logoutCall(dispatch) {
  try {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    await axios.post("/auth/logout");
    dispatch({ type: "LOGOUT" });
  } catch (error) {
    console.log(error);
    return error;
  }
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

export async function getConv(api, friend, currentUser) {
  try {
    const res = await api.get(
      `/conversations/${friend._id}/${currentUser._id}`
    );
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getConversation(api, userId, friend) {
  try {
    const res = await api.get(`conversations/${userId}/${friend._id}`);
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

export async function sendMessagetoUser(api, options = {}) {
  try {
    const res = await api.post("/messages", options);
    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
}
