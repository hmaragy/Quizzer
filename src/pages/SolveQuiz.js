import classes from "./SolveQuiz.module.css";

import Card from "../components/ui/Card";

import NotifMsg from "../components/NotifMsg";
import { useEffect, useRef, useState } from "react";
import { useCourses } from "../store/CoursesContext";
import { useAuth } from "../store/AuthContext";
import { useHistory, useParams } from "react-router-dom";
import Button from "../components/ui/FormButton";

const Answer = props => {
  const inputRef = useRef();
  useEffect(() => {
    inputRef.current.checked = false;
  }, [props.children]);

  function onChangeValue(e) {
    if (e.target.checked) {
      return props.onCorrectCheck(props.index);
    }
  }

  return (
    <div className={classes["quiz-question__answer"]}>
      <input ref={inputRef} onChange={onChangeValue} type="radio" id={"answer" + props.index} name="answer" />
      <label
        htmlFor={"answer" + props.index}
        onClick={onChangeValue}
        dangerouslySetInnerHTML={{ __html: props.children }}
      ></label>
    </div>
  );
};

const SolveQuiz = props => {
  const [error, setError] = useState("");
  const [notif, setNotif] = useState("");
  const [course, setCourse] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [curQuestionPos, setCurQuestionPos] = useState(0);

  const params = useParams();
  const history = useHistory();

  const { userInfo, updateUserInfo, getCourse, submitQuiz } = useCourses();
  const { user } = useAuth();

  useEffect(() => {
    updateUserInfo();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setError("");

        if (!userInfo) return;

        const course = await getCourse(params.cid);

        const userCourse = userInfo.courses.find(c => {
          if (c.cid === course.cid) {
            //course found.
            return true;
          }
          return false;
        });

        if (!userCourse) {
          return setError("Sorry, you are not enrolled to the course");
        }
        //We have the usercourse now...
        setCourse(userCourse);

        if (!userCourse?.quizzes) return;
        //Now getting the quiz
        const quiz = userCourse.quizzes.find(q => {
          if (q.uid === params.qid) {
            return true;
          }
          return false;
        });

        if (quiz.complete) {
          return setError("You already completed the quiz...");
        }

        //Check if quiz time had passed...
        if (new Date(+quiz.fromDate) > new Date() || new Date(+quiz.deadlineDate) < new Date()) {
          return setError("Sorry, Quiz time didn't begin or quiz time is up");
        }

        setQuiz(quiz);
      } catch (error) {
        setError(error.message);
        console.log(error);
      }
    })();
  }, [user, params.cid, userInfo, getCourse, params.qid]);

  useEffect(() => {
    (async () => {
      if (quiz?.complete) {
        await submitQuiz(quiz, params.cid);
        setIsLoading(false);
        history.push("/dashboard");
      }
    })();
  }, [history, params.cid, quiz, submitQuiz]);

  function selectAnswer(idx) {
    setQuiz(oldQuiz => {
      oldQuiz.problems[curQuestionPos].answers = oldQuiz.problems[curQuestionPos].answers.map((answer, index) => {
        if (idx === index) {
          answer.userSelected = true;
          return answer;
        }
        answer.userSelected = false;
        return answer;
      });

      return { ...oldQuiz, problems: oldQuiz.problems };
    });
  }

  async function submitSolution() {
    setQuiz(oldQuiz => {
      quiz.problems[curQuestionPos].answers.forEach(answer => {
        if (answer.userSelected) {
          if (answer.correct) {
            oldQuiz.problems[curQuestionPos].correct = true;
          } else {
            oldQuiz.problems[curQuestionPos].correct = false;
          }
        }
      });
      return { ...oldQuiz };
    });

    if (curQuestionPos === quiz.problems.length - 1) {
      setIsLoading(true);
      setQuiz(oldQuiz => {
        let q = { ...oldQuiz };
        let grade = 0;
        let totalGrade = q.problems.length;
        q.complete = true;
        q.problems.forEach(problem => {
          if (problem.correct) {
            ++grade;
          }
        });
        console.log(grade);
        q = { ...q, grade: ((grade / totalGrade) * 100).toFixed(2) };

        return q;
      });
    } else {
      setCurQuestionPos(old => old + 1);
    }
  }
  return (
    <div className={classes["solve-quiz"]}>
      <div className="container">
        <NotifMsg notif={notif} error={error} />
        <header className={classes["solve-quiz__header"]}>
          <div>
            <h1 className={classes["solve-quiz__header--main"]}>Solve Quiz</h1>
            <p className={classes["solve-quiz__header--sub"]}>{course.name}</p>
          </div>
        </header>
        <Card className={classes["quiz"]}>
          {quiz && (
            <>
              <header className={classes["quiz__header"]}>
                <p>
                  Question {curQuestionPos + 1} of {quiz.problems.length}
                </p>
                <p
                  className={classes["quiz__question"]}
                  dangerouslySetInnerHTML={{ __html: quiz.problems[curQuestionPos].question }}
                ></p>
              </header>
              <div className={classes["quiz__solutions"]}>
                {quiz.problems[curQuestionPos].answers.map((answer, index) => {
                  return (
                    <Answer onCorrectCheck={selectAnswer} key={index} index={index}>
                      {answer.value}
                    </Answer>
                  );
                })}
              </div>
              <div className={classes["quiz__actions"]}>
                <Button isLoading={isLoading} onClick={submitSolution}>
                  Submit
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SolveQuiz;
