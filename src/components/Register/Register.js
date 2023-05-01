import { useRef, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { register_user } from "../../apiCalls";
import { useNavigate } from "react-router-dom";

import "./Register.scss";

function Register() {
  const username = useRef(null);
  const email = useRef(null);
  const firstName = useRef(null);
  const lastName = useRef(null);
  const password_1 = useRef(null);
  const password_2 = useRef(null);

  const navigate = useNavigate();

  const [isVisible, setVisible] = useState(false);
  const [isVisible2, setVisible2] = useState(false);
  const { isFetching, dispatch, error } = useAuth();

  console.log({ errorIs: error });

  const visFunctions = {
    1: setVisible,
    2: setVisible2,
  };

  function handleSignIn(e) {
    e.preventDefault();
    dispatch({ type: "SET_ERROR_NULL" });
    navigate("/login");
  }

  async function handleForm(e) {
    e.preventDefault();
    console.log({ username });
    if (password_1.current.value !== password_2.current.value) {
      dispatch({
        type: "SET_ERROR",
        payload: { type: "password", message: "passwords do not match" },
      });
    } else {
      const user = {
        username: username.current.value,
        password: password_1.current.value,
        first_name: firstName.current.value,
        last_name: lastName.current.value,
        email: email.current.value,
      };

      const data = await register_user(user, dispatch);

      console.log({ data });

      if (data.status === 200) navigate("/");
    }
  }

  function handleVisible(num) {
    visFunctions[num]((prev) => !prev);

    let password = document.querySelector(`.password-${num}`);
    password.setAttribute(
      "type",
      password.type === "text" ? "password" : "text"
    );
  }

  function handleResetError(e) {
    if (error?.type === e.target.name) {
      dispatch({ type: "SET_ERROR_NULL" });
    }
  }

  return (
    <>
      <div className="form-container">
        <div className="signup-container">
          <h2>Sign Up</h2>
          <form className="login-form" onSubmit={handleForm}>
            <input
              type="text"
              required
              placeholder="Username"
              ref={username}
              onChange={handleResetError}
              name="username"
            />
            <input
              type="email"
              required
              placeholder="Email"
              ref={email}
              onChange={handleResetError}
              name="email"
            />
            <input
              type="text"
              required
              placeholder="First Name"
              ref={firstName}
              onChange={handleResetError}
              name="first_name"
            />
            <input
              type="text"
              required
              placeholder="Last Name"
              ref={lastName}
              onChange={handleResetError}
              name="last_name"
            />
            <div className="password-container">
              <input
                className="password-1"
                type="password"
                placeholder="Password"
                required
                ref={password_1}
                minLength="8"
                onChange={handleResetError}
                name="password"
              />
              <span
                className="visibility-icon"
                onClick={() => handleVisible("1")}
              >
                {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </span>
            </div>
            <div className="password-container">
              <input
                className="password-2"
                type="password"
                placeholder="Password"
                required
                ref={password_2}
                minLength="8"
                onChange={handleResetError}
                name="password"
              />
              <span
                className="visibility-icon"
                onClick={() => handleVisible("2")}
              >
                {isVisible2 ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </span>
            </div>

            {error && <p className="error">{error?.message}</p>}

            <button type="submit" className="btn-sign-in">
              {isFetching ? (
                <CircularProgress
                  sx={{
                    color: "blue",
                  }}
                  size="25px"
                />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="form-container" onClick={handleSignIn}>
        <div className="form">
          <div className="login-form">
            <button type="submit" className="btn-sign-up">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
