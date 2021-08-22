import React, { useEffect, useState } from "react";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import FormButton from "../components/ui/FormButton";
import NotifMsg from "../components/NotifMsg";

import classes from "./Login.module.css";
import { useAuth } from "../store/AuthContext";
import { useHistory } from "react-router-dom";

const Login = () => {
  const [userInfo, setUserInfo] = useState({ email: "", password: "" });
  const [isMounted, setIsMounted] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (user.isLoggedIn) {
      history.push("/dashboard");
    }

    return () => {
      setIsMounted(false);
    };
  }, [history, user]);

  const handleInput = e => {
    const value = e.target.value;
    const name = e.target.name;
    setUserInfo(olduserInfo => {
      return { ...olduserInfo, [name]: value };
    });
  };

  const validateInput = ({ email, password }) => {
    //simple validation
    if (password.length >= 8) {
      return true;
    }
    return false;
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    if (!validateInput(userInfo)) {
      setIsLoading(false);
      return setLoginError(
        "Please make sure that you entered a valid email and your password with length >= 8 characters"
      );
    }

    try {
      await login(userInfo.email, userInfo.password);
    } catch (error) {
      setLoginError(error.message);
    }
    isMounted && setIsLoading(false);
  };

  return (
    <div className="container">
      <Card className={classes["login"]}>
        <div className={classes["login-header"]}>
          <h2 className={classes["login-header__text"]}>Please enter your Login info</h2>
        </div>

        <NotifMsg error={loginError} />

        <form onSubmit={handleLogin}>
          <Input
            autoComplete="current-mail"
            onChange={handleInput}
            type="email"
            id="email"
            name="email"
            value={userInfo.email}
            label="Email"
          />
          <Input
            autoComplete="current-password"
            onChange={handleInput}
            type="password"
            id="password"
            name="password"
            value={userInfo.password}
            label="Password"
          ></Input>
          <FormButton disabled={isLoading} type="submit" isLoading={isLoading}>
            Login
          </FormButton>
        </form>
      </Card>
    </div>
  );
};

export default Login;
