import React, { useEffect, useState } from "react";

import { useHistory } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

const Logout = () => {
  const { logout } = useAuth();
  const [error, setError] = useState("");
  const history = useHistory();

  useEffect(() => {
    (async function signout() {
      try {
        await logout();
        history.push("/dashboard");
      } catch (error) {
        setError(error.message);
      }
    })();
  });

  return <div>{error ? error : "logging out..."}</div>;
};

export default Logout;
