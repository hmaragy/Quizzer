import React, { useEffect, useRef, useState } from "react";
import classes from "./CreateCourse.module.css";

import NotifMsg from "../components/NotifMsg";

import { useCourses } from "../store/CoursesContext";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import FormButton from "../components/ui/FormButton";
import { BiCopy } from "react-icons/bi";

function CreateCourse() {
  const [error, setError] = useState("");
  const [notif, setNotif] = useState("");
  const [isLoading, setIsLoading] = useState("");
  const { createCourse, userInfo } = useCourses();
  const [courseInfo, setCourseInfo] = useState({ name: "", code: "" });
  const [isMounted, setIsMounted] = useState(true);
  const [cid, setCid] = useState("");
  const cidRef = useRef(null);

  const handleInput = e => {
    const value = e.target.value;
    const name = e.target.name;
    setCourseInfo(olduserInfo => {
      return { ...olduserInfo, [name]: value };
    });
  };

  const validateInput = ({ name, code }) => {
    if (name && code) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!userInfo.isTeacher) {
      return setError("You have to be a teacher to create a course, signup as a teacher.");
    }

    setError("");
    setIsLoading(true);
    if (!validateInput(courseInfo)) {
      setIsLoading(false);
      return setError("Please make sure that you entered a valid Information.");
    }

    try {
      const cid = await createCourse(courseInfo.name, courseInfo.code, courseInfo.description);
      setNotif("Course Created Successfully.");
      setTimeout(() => {
        setNotif("");
      }, 1000);
      setCid(cid);
    } catch (error) {
      setError(error.message);
    }
    isMounted && setIsLoading(false);
  }

  function copyCid() {
    setNotif("");
    let copyText = cidRef.current;
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    setNotif("Code Copied Successfully");
  }

  return (
    <>
      {cid && (
        <div className="container">
          <Card border flat className={classes["enroll"]}>
            <NotifMsg error={error} notif={notif} />
            <div className={classes["enroll-header"]}>
              <h2 className={classes["enroll-header__title"]}>Course Created Successfully</h2>
              <p className={classes["enroll-header__text"]}>Please copy the code below and give it to your students.</p>
            </div>
            <div className={classes["cid-copy"]}>
              <Input innerRef={cidRef} disabled autoComplete="off" type="text" id="code" name="code" value={cid} />
              <button onClick={copyCid} className={classes["cid-copy__button"]}>
                <BiCopy />
              </button>
            </div>
          </Card>
        </div>
      )}
      {!cid && (
        <div className="container">
          <Card border flat className={classes["enroll"]}>
            <div className={classes["enroll-header"]}>
              <h2 className={classes["enroll-header__title"]}>Create Course</h2>
              <p className={classes["enroll-header__text"]}>Please Enter Course Information.</p>
            </div>

            <NotifMsg error={error} notif={notif} />

            <form autoComplete="off" onSubmit={handleCreate}>
              <Input
                autoComplete="off"
                onChange={handleInput}
                type="text"
                id="name"
                name="name"
                value={courseInfo.name}
                label="Course Name, EG: Engineering Biology 101"
              />
              <Input
                autoComplete="off"
                onChange={handleInput}
                type="text"
                id="code"
                name="code"
                value={courseInfo.code}
                label="Course Code, EG: CSE254"
              />
              <FormButton className={classes["center"]} disabled={isLoading} type="submit" isLoading={isLoading}>
                Enroll to course
              </FormButton>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

export default CreateCourse;
