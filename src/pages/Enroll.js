import React, { useState } from "react";
import classes from "./Enroll.module.css";

import NotifMsg from "../components/NotifMsg";

import { useCourses } from "../store/CoursesContext";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import FormButton from "../components/ui/FormButton";
import { useHistory } from "react-router-dom";

function Enroll() {
  const [error, setError] = useState("");
  const [notif, setNotif] = useState("");
  const [isLoading, setIsLoading] = useState("");
  const [courseId, setCourseId] = useState("");
  const { enrollToCourse, userInfo } = useCourses();
  const history = useHistory();

  function handleInput(e) {
    setCourseId(e.target.value);
  }

  async function handleEnroll(e) {
    e.preventDefault();
    try {
      if (!userInfo.isTeacher) {
        setIsLoading(true);
        await enrollToCourse(courseId);
        setNotif("You have successfully enrolled to course, we're redirecting you now to the dashboard ^^.");
        setTimeout(function () {
          history.push("/dashboard");
        }, 2000);
      } else {
        setError("You are a teacher, please create a student account to enroll.");
      }
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }

  return (
    <div className="container">
      <Card border flat className={classes["enroll"]}>
        <div className={classes["enroll-header"]}>
          <h2 className={classes["enroll-header__title"]}>Enroll to course</h2>
          <p className={classes["enroll-header__text"]}>Please paste the course ID supplied by your instructor.</p>
        </div>

        <NotifMsg error={error} notif={notif} />

        <form autoComplete="off" onSubmit={handleEnroll}>
          <Input
            autoComplete="off"
            onChange={handleInput}
            type="text"
            id="enrol"
            name="enrol"
            value={courseId}
            label="Course ID"
          />
          <FormButton className={classes["center"]} disabled={isLoading} type="submit" isLoading={isLoading}>
            Enroll to course
          </FormButton>
        </form>
      </Card>
    </div>
  );
}

export default Enroll;
