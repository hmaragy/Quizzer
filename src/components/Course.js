import React from "react";

import Card from "./ui/Card";
import Screen from "./ui/Screen";

import classes from "./Course.module.css";

import { HiArrowNarrowRight } from "react-icons/hi";
import { BiCopy, BiAddToQueue } from "react-icons/bi";

import { Link } from "react-router-dom";

function Course(props) {
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

  return (
    <Card className={classes["course"]}>
      <Screen actions={COURSE_ACTIONS} title={props.name}>
        {props.quizzes.map((quiz, index) => {
          return (
            <div className={classes["quiz"]} key={index}>
              <div className={classes["quiz-date"]}>{quiz.date}</div>
              <div className={classes["quiz-name"]}>{quiz.name}</div>
              {quiz.complete && <div className={classes["quiz-result"]}>{quiz.grade}</div>}
              {!quiz.complete && (
                <Link to={"/courses/" + props.name + quiz.id} className={classes["take-quiz"]}>
                  <HiArrowNarrowRight />
                </Link>
              )}
            </div>
          );
        })}
      </Screen>
    </Card>
  );
}

export default Course;
