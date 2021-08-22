import React, { useEffect, useState } from "react";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import FormButton from "../components/ui/FormButton";
import NotifMsg from "../components/NotifMsg";

import classes from "./Signup.module.css";
import { useAuth } from "../store/AuthContext";
import { useHistory } from "react-router-dom";

const Login = () => {
  const [userInfo, setUserInfo] = useState({ email: "", password: "", isTeacher: false, name: "", cpassword: "" });
  const [isMounted, setIsMounted] = useState(true);
  const [signupError, setSignupError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user } = useAuth();
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
    const name = e.target.name;
    let value = e.target.value;

    if (name === "isTeacher") {
      value = e.target.checked;
    }

    setUserInfo(olduserInfo => {
      return { ...olduserInfo, [name]: value };
    });
  };

  const validateInput = ({ email, password, cpassword, name }) => {
    //simple validation
    if (password.length < 8) {
      return "Password Length should be >= 8";
    } else if (cpassword !== password) {
      return "Password Missmatch";
    } else if (!/^[ a-zA-Z\u00E0-\u00FC]+$/i.test(name)) {
      return "Enter a valid name without numbers, only letters and umlauts.";
    }
    return false;
  };

  const handleSignup = async e => {
    e.preventDefault();
    setSignupError("");
    setIsLoading(true);

    if (validateInput(userInfo)) {
      setIsLoading(false);
      return setSignupError(validateInput(userInfo));
    }

    try {
      await signup(userInfo.email, userInfo.password, userInfo.name, userInfo.isTeacher);
    } catch (error) {
      setSignupError(error.message);
    }
    isMounted && setIsLoading(false);
  };

  return (
    <div className="container">
      <Card className={classes["signup"]}>
        <div className={classes["signup-header"]}>
          <h2 className={classes["signup-header__text"]}>Please enter your info</h2>
        </div>

        <NotifMsg error={signupError} />

        <form onSubmit={handleSignup}>
          <Input
            autoComplete="current-name"
            onChange={handleInput}
            type="text"
            id="name"
            name="name"
            value={userInfo.name}
            label="Full name"
          />
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
          <Input
            autoComplete="off"
            onChange={handleInput}
            type="password"
            id="cpassword"
            name="cpassword"
            value={userInfo.cpassword}
            label="Confirm password"
          ></Input>

          <div className={classes["checkbox-wrapper"]}>
            <input onChange={handleInput} type="checkbox" id="teacher" name="isTeacher" />
            <label htmlFor="teacher">I am a teacher.</label>
          </div>

          <FormButton disabled={isLoading} type="submit" isLoading={isLoading}>
            Signup
          </FormButton>
        </form>
      </Card>
    </div>
  );
};

export default Login;
