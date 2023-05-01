import { useRef, useState } from "react";
import "./Login.scss";
import { loginCall } from "../../apiCalls";
import { useAuth } from "../../context/AuthContext";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Login() {
  const email = useRef(null);
  const password = useRef(null);
  const { isFetching, dispatch, error } = useAuth();
  const [isVisible, setVisible] = useState(false);
  const navigate = useNavigate();

  console.log({ error });

  async function handleForm(e) {
    e.preventDefault();

    console.log("password type of: ", typeof password.current.value);

    const data = await loginCall(
      {
        email: email.current.value.trim(),
        password: password.current.value.trim(),
      },
      dispatch
    );

    console.log({ data });

    if (data.status === 200) navigate("/");
  }

  function handleSignUp(e) {
    e.preventDefault();
    dispatch({ type: "SET_ERROR_NULL" });
    navigate("/register");
  }

  function handleVisible() {
    setVisible((prev) => !prev);
    let password = document.querySelector(".password");
    password.setAttribute(
      "type",
      password.type === "text" ? "password" : "text"
    );
  }

  function handleOnChange() {
    if (error) {
      console.log("handleOnchange");
      dispatch({ type: "SET_ERROR_NULL" });
    }
  }

  return (
    <>
      <div className="form-container">
        <div className="form">
          <h2>Sign In</h2>
          <form className="login-form" onSubmit={handleForm}>
            <input
              onChange={handleOnChange}
              type="text"
              placeholder="Email or Username"
              required
              ref={email}
            />
            <div className="password-container">
              <input
                onChange={handleOnChange}
                className="password"
                type="password"
                placeholder="Password"
                required
                ref={password}
                minLength="8"
              />
              <span className="visibility-icon" onClick={handleVisible}>
                {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </span>
              {error && <p className="error">{error?.message}</p>}
            </div>

            <button type="submit" className="btn-sign-in">
              {isFetching ? (
                <CircularProgress
                  sx={{
                    color: "blue",
                  }}
                  size="25px"
                />
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="form-container">
        <div className="form" onClick={handleSignUp}>
          <div className="login-form">
            <button type="submit" className="btn-sign-up">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
