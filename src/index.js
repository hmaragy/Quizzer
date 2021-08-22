import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter } from "react-router-dom";

import "./global.css";

import App from "./App";
import { AuthProvider } from "./store/AuthContext";
import { CoursesProvider } from "./store/CoursesContext";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CoursesProvider>
          <App />
        </CoursesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
