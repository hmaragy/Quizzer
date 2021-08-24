import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs"; // load on demand

import Card from "./ui/Card";
import Screen from "./ui/Screen";
import Loading from "./ui/Loading";

import classes from "./Course.module.css";

import { HiArrowNarrowRight } from "react-icons/hi";
import { BiCopy, BiAddToQueue } from "react-icons/bi";
import { TiTick } from "react-icons/ti";

import { useCourses } from "../store/CoursesContext";

function Course(props) {
  const { getQuizzes } = useCourses();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const q = await getQuizzes(props.cid);
      setIsLoading(false);
      setQuizzes(q.reverse());
    })();
  }, []);

  const COURSE_ACTIONS = [
    {
      title: "Copy Course ID",
      onClick: function () {
        const tempInput = document.createElement("input");
        tempInput.value = props.cid;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert("Copied.");
      },
      icon: <BiCopy />,
    },
    {
      title: "Create Quiz",
      onClick: function () {
        props.onCreateQuizClick(props.name, props.cid, props.code);
      },
      icon: <BiAddToQueue />,
    },
  ];

  function formatDate(fromDate) {
    const d = new Date(+fromDate);
    console.log(d);
    return dayjs(d).format("DD/MM/YYYY hh:mm A");
  }
  return (
    <Card className={classes["course"]}>
      <Screen actions={COURSE_ACTIONS} title={props.name}>
        {isLoading && <Loading loading={isLoading} />}
        {!isLoading &&
          quizzes?.map((quiz, index) => {
            return (
              <div className={classes["quiz"]} key={quiz.uid}>
                <div className={classes["quiz-dates"]}>
                  <div className={classes["quiz-from-date"]}>Start: {formatDate(quiz.fromDate)}</div>
                  <div className={classes["quiz-deadline-date"]}>DeadLine: {formatDate(quiz.deadlineDate)}</div>
                </div>
                {!props.teacher && (
                  <>
                    <div className={classes["quiz-grade"]}>Grade: {quiz.grade || "0%"}</div>
                    {!quiz.complete && (
                      <Link to={"/courses/" + props.cid + "/quizzes/" + quiz.uid} className={classes["take-quiz"]}>
                        <HiArrowNarrowRight />
                      </Link>
                    )}
                    {quiz.complete && (
                      <TiTick title="quiz complete" className={`${classes["take-quiz"]} ${classes["quiz-complete"]}`} />
                    )}
                  </>
                )}
                {props.teacher && <>{new Date(+quiz.deadlineDate) < new Date() && <div>Quiz Complete</div>}</>}
                {props.teacher && <>{new Date(+quiz.deadlineDate) > new Date() && <div>Quiz Active</div>}</>}
              </div>
            );
          })}
      </Screen>
    </Card>
  );
}

export default Course;
