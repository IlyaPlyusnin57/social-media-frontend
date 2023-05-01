function LoginStart(userCredentials) {
  return {
    type: "LOGIN_START",
  };
}

function LoginSuccess(user) {
  return {
    type: "LOGIN_SUCCESS",
    payload: user,
  };
}

function LoginFailure() {
  return {
    type: "LOGIN_FAILURE",
  };
}

function Follow(userId) {
  return {
    type: "FOLLOW",
    payload: userId,
  };
}

function Unfollow(userId) {
  return {
    type: "UNFOLLOW",
    payload: userId,
  };
}

export { LoginStart, LoginSuccess, LoginFailure, Follow, Unfollow };
