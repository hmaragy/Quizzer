import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { useCourses } from "../../store/CoursesContext";
import classes from "./Nav.module.css";

const Nav = () => {
  const { user } = useAuth();
  const { userInfo } = useCourses();

  return (
    <nav className={classes["nav"]}>
      <div className="container">
        <h1 className={classes["nav__logo"]}>
          <Link className={classes["nav__link"]} to="/">
            Quizzer
          </Link>
        </h1>
        <ul className={classes["nav__list"]}>
          {user?.isLoggedIn && userInfo?.isTeacher && (
            <li className={classes["nav__list-item"]}>
              <NavLink
                activeClassName={classes["nav__link--active"]}
                className={classes["nav__link"]}
                to="/courses/create"
              >
                Create Course
              </NavLink>
            </li>
          )}
          {user?.isLoggedIn && !userInfo?.isTeacher && (
            <li className={classes["nav__list-item"]}>
              <NavLink
                activeClassName={classes["nav__link--active"]}
                className={classes["nav__link"]}
                to="/courses/enroll"
              >
                Enroll to course
              </NavLink>
            </li>
          )}
          {!user?.isLoggedIn && (
            <>
              <li className={classes["nav__list-item"]}>
                <NavLink activeClassName={classes["nav__link--active"]} className={classes["nav__link"]} to="/login">
                  Login
                </NavLink>
              </li>
              <li className={classes["nav__list-item"]}>
                <NavLink activeClassName={classes["nav__link--active"]} className={classes["nav__link"]} to="/register">
                  Register
                </NavLink>
              </li>
            </>
          )}
          {user?.isLoggedIn && (
            <>
              <li className={classes["nav__list-item"]}>
                <NavLink
                  activeClassName={classes["nav__link--active"]}
                  className={classes["nav__link"]}
                  to="/dashboard"
                >
                  Dashboard
                </NavLink>
              </li>
              <li className={classes["nav__list-item"]}>
                <NavLink activeClassName={classes["nav__link--active"]} className={classes["nav__link"]} to="/logout">
                  Logout
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Nav;
