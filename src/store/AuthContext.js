import React, { useContext, useEffect, useState } from "react";

import { auth, db } from "../firebase";

const AuthContext = React.createContext(undefined);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    isLoggedIn: false,
    user: null,
  });

  useEffect(() => {
    auth.onAuthStateChanged(user => {
      user ? setUser({ isLoggedIn: true, user }) : setUser({ isLoggedIn: false, user: null });
    });
  }, []);

  async function login(email, password) {
    try {
      const loggedInUser = await auth.signInWithEmailAndPassword(email, password);
      const userObj = { isLoggedIn: true, user: loggedInUser.user };
      setUser(userObj);
      return userObj;
    } catch (error) {
      switch (error.code) {
        case "auth/wrong-password":
        case "auth/user-not-found":
          throw new Error("Username or Password are incorrect");
        case "auth/invalid-email":
          throw new Error("Please enter a valid email address");
        default:
          throw new Error("An error occured, please try again later");
      }
    }
  }

  async function setUserInfo(uid, name, isTeacher) {
    try {
      const userInfo = {
        uid,
        name,
        isTeacher,
      };
      return await db.collection("users").add(userInfo);
    } catch (error) {
      throw new Error("An Error occured, please check your connection and try again.");
    }
  }

  async function signup(email, password, name, isTeacher) {
    try {
      const signedupUser = await auth.createUserWithEmailAndPassword(email, password);

      const userObj = { isLoggedIn: true, user: signedupUser.user };
      await setUserInfo(userObj.user.uid, name, isTeacher);
      setUser(userObj);
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          throw new Error("Email address is already in use.");
        default:
          throw new Error("An error occured, please try again later");
      }
    }
  }

  async function logout() {
    try {
      return await auth.signOut();
    } catch (e) {
      throw new Error("An error occured, please refresh the page and try again.");
    }
  }

  const value = {
    user,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
