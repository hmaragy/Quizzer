import React, { useEffect, useState } from "react";
import classes from "./Dashboard.module.css";

import NotifMsg from "../components/NotifMsg";
import TeacherDashboard from "../components/layout/TeacherDashboard";
import StudentDashboard from "../components/layout/StudentDashboard";

import { useCourses } from "../store/CoursesContext";
import { useAuth } from "../store/AuthContext";

function Dashboard() {
  const [error, setError] = useState("");
  const [notif, setNotif] = useState("");
  const [courses, setCourses] = useState();

  const { getCourses, userInfo } = useCourses();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const courses = await getCourses();
        setCourses(courses);
      } catch (error) {
        setError(error.message);
      }
    })();
  }, [getCourses, user]);

  const dashboard = userInfo?.isTeacher ? (
    <TeacherDashboard courses={courses} />
  ) : (
    <StudentDashboard courses={courses} />
  );

  return (
    <>
      <div className={classes["notif"]}>
        <NotifMsg error={error} notif={notif} />
      </div>
      <div className={`${classes["dashboard"]} container`}>{dashboard}</div>
    </>
  );
}

export default Dashboard;
