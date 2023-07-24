import axios from "axios";
import CryptoJS from "crypto-js";
import { filterArray } from "./helper_functions/filterArray";

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

    sessionStorage.setItem("accessToken", new_user.accessToken);

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
    return filterArray(res.data);
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function getFollowers(api, user) {
  try {
    const res = await api.get(`/users/${user._id}/followers`);
    return filterArray(res.data);
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

export async function getUser2(api, username) {
  try {
    const res = await api.get(`/users/byUsername/${username}`);
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
  conversationId
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
      socket?.emit("sendFollow", res.data);
    }

    refetch();
  } catch (error) {
    console.log(error);
  }
}

export async function unfollowUser(api, user, currentUser, refetch, socket) {
  try {
    const res = await api.patch(`/users/${user._id}/unfollow`, {
      userId: currentUser._id,
    });

    if (res?.status === 200) {
      socket?.emit("sendFollow", res.data);
    }

    refetch();
  } catch (error) {
    console.log(error);
  }
}

export async function removeNotification(api, userId, options = {}) {
  try {
    const res = await api.patch(`/notifications/${userId}`, options);

    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPost(api, postId) {
  try {
    const res = await api.get(`/posts/${postId}`);

    return res.data;
  } catch (error) {
    console.log({ error });

    if (error.response.status === 404) {
      return null;
    }
  }
}

export async function likePost(api, postId, currentUser) {
  try {
    const res = await api.put(`posts/${postId}/like`, {
      user: currentUser,
    });

    return res;
  } catch (error) {
    console.log(error);
    const res = { status: 0 };

    if (error.response.status === 404) {
      res["status"] = 404;
      return res;
    }
  }
}

export async function getTaggedPosts(api, userId, options = {}) {
  try {
    const res = await api.post(`/posts/tagged/${userId}`, options);

    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getPostLikers(api, postId) {
  try {
    const res = await api.get(`posts/${postId}/postLikers`);

    return res.data;
  } catch (error) {
    console.log(error);

    const res = { status: 0 };

    if (error.response.status === 404) {
      res["status"] = 404;
      return res;
    }
  }
}

export async function getUsersFeedForADay(api, userId, options = {}) {
  try {
    const res = await api.post(`posts/getFeedForADay/${userId}`, options);

    return res.data;
  } catch (error) {
    console.log(error);
  }
}

export async function createComment(api, options) {
  try {
    const res = await api.post("comments/", options);

    return res;
  } catch (error) {
    console.log(error);
    const res = { status: 0 };

    if (error.response.status === 404) {
      res["status"] = 404;
      return res;
    }
  }
}

export async function getComment(api, options) {
  try {
    const res = await api.post("comments/getComment", options);

    return res.data;
  } catch (error) {
    console.log(error);
    const res = { status: 0 };

    if (error.response.status === 404) {
      res["status"] = 404;
      return res;
    }
  }
}

export async function getCommentReply(api, options) {
  try {
    const res = await api.post("comments/getCommentReply", options);

    return res.data;
  } catch (error) {
    console.log(error);
    const res = { status: 0 };

    if (error.response.status === 404) {
      res["status"] = 404;
      return res;
    }
  }
}

export async function editComment(api, options = {}) {
  try {
    const res = await api.post("comments/edit", options);

    return res;
  } catch (error) {
    console.log(error);
    const res = { status: 0 };

    if (error.response.status === 404) {
      res["status"] = 404;
      return res;
    }
  }
}

export async function deleteComment(
  api,
  commentId,
  commenter,
  post,
  type,
  parentCommentId
) {
  try {
    const body = {
      data: {
        commenter,
        userId: post.userId,
        postId: post._id,
        type,
        parentCommentId,
      },
    }; // to send a request body in axios for a delete method, you have to send it as an object with a data property

    const res = await api.delete(`comments/${commentId}`, body);

    return res;
  } catch (error) {
    console.log(error);
    const res = { status: 0 };

    if (error.response.status === 404) {
      res["status"] = 404;
      return res;
    }
  }
}

export async function likeDislikeComment(
  api,
  post,
  commentId,
  currentUser,
  isLiking,
  type
) {
  try {
    const res = await api.put(`comments/${commentId}/likeDislike`, {
      user: currentUser,
      post,
      isLiking,
      type,
    });

    return res;
  } catch (error) {
    console.log(error);
    const res = { status: 0 };

    if (error.response.status === 404) {
      res["status"] = 404;
      return res;
    }
  }
}
