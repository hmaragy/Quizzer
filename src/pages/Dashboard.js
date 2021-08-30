import React, { useEffect, useState } from "react";
import classes from "./Dashboard.module.css";

import NotifMsg from "../components/NotifMsg";
import TeacherDashboard from "../components/layout/TeacherDashboard";
import StudentDashboard from "../components/layout/StudentDashboard";

import { useCourses } from "../store/CoursesContext";
import { useAuth } from "../store/AuthContext";
import { useHistory } from "react-router-dom";

function Dashboard() {
  const [error, setError] = useState("");
  const [courses, setCourses] = useState();

  const history = useHistory();

  const { getCourses, userInfo } = useCourses();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const courses = await getCourses();
        if (!courses || courses.length === 0) {
          if (userInfo && userInfo.isTeacher) {
            return history.push("/courses/create");
          } else {
            return history.push("/courses/enroll");
          }
        }
        setCourses(courses);
      } catch (error) {
        setError(error.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userInfo?.isTeacher]);

  const dashboard = userInfo?.isTeacher ? (
    <TeacherDashboard courses={courses} />
  ) : (
    <StudentDashboard courses={courses} />
  );

  return (
    <>
      <div className={classes["notif"]}>
        <NotifMsg error={error} />
      </div>
      <div className={`${classes["dashboard"]} container`}>{dashboard}</div>
    </>
  );
}

export default Dashboard;
