import classes from "./CreateQuiz.module.css";

import { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import DateTimePicker from "react-datetime-picker";

import { useAuth } from "../store/AuthContext";
import { useCourses } from "../store/CoursesContext";

import Card from "../components/ui/Card";
import Button from "../components/ui/FormButton";
import NotifMsg from "../components/NotifMsg";

import Editor from "../components/Editor";

const Answer = props => {
  function emitChildren() {
    return props.onClick(props.children, props.index);
  }

  function onChangeValue(e) {
    if (e.target.checked) {
      return props.onCorrectCheck(props.index);
    }
  }

  return (
    <div className={classes["quiz-question__answer"]}>
      <input checked={props.correct} onChange={onChangeValue} type="radio" name="answer" id={"answer" + props.index} />
      <label
        htmlFor={"answer" + props.index}
        onClick={emitChildren}
        dangerouslySetInnerHTML={{ __html: props.children }}
      ></label>
    </div>
  );
};

const Question = props => {
  function emitChildren() {
    return props.onClick(props.children);
  }

  return <h3 onClick={emitChildren} dangerouslySetInnerHTML={{ __html: props.children }}></h3>;
};

/* CONSTANTS */
const QUESTION = "QUESTION";
const ANSWER = "ANSWER";

const CreateQuiz = () => {
  const params = useParams();
  const history = useHistory();

  const [fromDate, onFromDateChange] = useState(new Date());
  const [deadlineDate, onDeadlineDateChange] = useState(new Date());

  const [quiz, setQuiz] = useState({});
  const [quizPtr, setQuizPtr] = useState(0);

  /* Disabled state for all buttons */
  const [isDisabled, setIsDisabled] = useState({ next: true, previous: true, add: true, publish: true });
  const [isLoading, setIsLoading] = useState(false);

  const [course, setCourse] = useState([]);
  const [error, setError] = useState("");
  const [notif, setNotif] = useState("");

  const [startBuilding, setStartBuilding] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showTools, setShowTools] = useState(false);

  /* Currently Editing question or answer. */
  const [currentlyEditing, setCurrentlyEditing] = useState({ type: QUESTION });

  /* TinyMCE Ref */
  const contentRef = useRef();

  const { user } = useAuth();
  const { getCourse, createQuiz } = useCourses();

  /* Get course in question. */
  useEffect(() => {
    (async () => {
      try {
        const course = await getCourse(params.cid);
        if (course?.teacher !== user.user?.uid) {
          setError("You are not the teacher of this course!");
        } else {
          setError("");
          if (course) {
            setCourse(course);
          } else {
            setError("Course Not found, please go back to your dashboard and choose the right course.");
          }
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [getCourse, params.cid, user]);

  useEffect(() => {
    if (quiz.problems) {
      if (quiz?.problems[quizPtr]?.answers.length <= 1) {
        setIsDisabled(old => {
          return { ...old, next: true, previous: true, add: true };
        });
      } else if (quiz?.problems[quizPtr]?.answers.length > 1) {
        setShowTools(true);
        setIsDisabled(old => {
          return { ...old, add: false };
        });
      }

      if (quizPtr < quiz?.problems.length - 1) {
        setIsDisabled(old => {
          return { ...old, next: false };
        });
      }

      if (quizPtr > 0) {
        setIsDisabled(old => {
          return { ...old, previous: false };
        });
      }

      if (quizPtr === 0 && quizPtr < quiz.problems.length - 1) {
        setIsDisabled(old => {
          return { ...old, previous: true, next: false };
        });
      }

      if (quizPtr === quiz.problems.length - 1) {
        setIsDisabled(old => {
          return { ...old, next: true };
        });
      }

      if (quiz.problems.length > 0 && quiz.problems[0].question && quiz.problems[0].answers.length > 1) {
        setIsDisabled(old => {
          return { ...old, publish: false };
        });
      }

      if (quizPtr === 0 && quizPtr === quiz.problems.length - 1) {
        setIsDisabled(old => {
          return { ...old, previous: true, next: true };
        });
      }
    }
  }, [quiz, quizPtr]);

  /* Helper functions for state...*/
  function updateQuiz(pointer, value, currentlyEditing) {
    setQuiz(oldQuiz => {
      let q = [...oldQuiz.problems];
      q = q.map((problem, i) => {
        if (i === pointer) {
          if (currentlyEditing.type === QUESTION) {
            return { ...problem, question: value };
          } else if (currentlyEditing.type === ANSWER) {
            return {
              ...problem,
              answers: problem.answers.map((answer, i) => {
                if (i === currentlyEditing.index) {
                  return {
                    ...answer,
                    value: value,
                  };
                }
                return answer;
              }),
            };
          }
        }
        return problem;
      });
      return { ...oldQuiz, problems: q };
    });
  }

  function clearEditor() {
    contentRef?.current?.editor?.setContent("");
  }

  function updateEditor(content) {
    contentRef.current.editor.setContent(content);
  }

  /* Handle content while typing... */
  function handleContent(content) {
    if (currentlyEditing.type === QUESTION) {
      updateQuiz(quizPtr, content, currentlyEditing);
    } else {
      updateQuiz(quizPtr, content, currentlyEditing);
    }
  }

  function setQuizTime() {
    if (!fromDate || !deadlineDate) {
      return setError("You have to set correct dates");
    }

    const from = new Date(fromDate).getTime().toString();
    const to = new Date(deadlineDate).getTime().toString();

    if (to <= from) {
      return setError("The deadline should come after the start date...");
    }

    setQuiz(oldQuiz => {
      return { ...oldQuiz, fromDate: from, deadlineDate: to };
    });

    setStartBuilding(true);
  }

  /* Start adding 1st question */
  function addQuestion() {
    clearEditor();
    setShowQuestion(true);

    setQuizPtr(0);

    setQuiz(oldQuiz => {
      return {
        ...oldQuiz,
        problems: [
          {
            question: "",
            answers: [],
          },
        ],
      };
    });

    setCurrentlyEditing({ type: QUESTION });
  }

  /* Everytime add answer is clicked. */
  function addAnswer() {
    // First time
    if (!showAnswers) {
      setShowAnswers(true);
    }

    clearEditor();

    //todo: Understand this weird phenomenon. State updates twice in deeply nested elements. Weird
    const problems = quiz.problems.map((q, i) => {
      if (i === quizPtr) {
        q.answers.push({
          value: "",
          correct: false,
        });
      }
      return q;
    });
    setQuiz(oldQuiz => {
      return { ...oldQuiz, problems: problems };
    });

    setCurrentlyEditing({ type: ANSWER, index: quiz.problems[quizPtr].answers.length - 1 });
  }

  function onCorrectCheck(i) {
    const problems = [...quiz.problems];
    problems[quizPtr].answers = problems[quizPtr].answers.map((a, index) => {
      if (index === i) {
        a.correct = true;
      } else {
        a.correct = false;
      }
      return a;
    });

    setQuiz(oldQuiz => {
      return { ...oldQuiz, problems: problems };
    });
  }

  function addNewQuestion() {
    clearEditor();
    setShowQuestion(true);

    setQuizPtr(quiz.problems.length);

    setQuiz(oldQuiz => {
      return {
        ...oldQuiz,
        problems: [
          ...oldQuiz.problems,
          {
            question: "",
            answers: [],
          },
        ],
      };
    });

    setCurrentlyEditing({ type: QUESTION });
  }

  function editQuestion(question) {
    setCurrentlyEditing({ type: QUESTION });
    updateEditor(question);
  }

  function editAnswer(answer, index) {
    setCurrentlyEditing({ type: ANSWER, index });
    updateEditor(answer);
  }

  function cancelQuizCreation() {
    history.push("/dashboard");
  }

  async function publishQuiz() {
    try {
      //First clean the quiz array.
      setIsLoading(true);
      const q = quiz.problems.filter(q => {
        if (q.question && q.answers.length >= 1) {
          let correct = false;
          for (let answer of q.answers) {
            if (!answer.value) throw new Error("Please make all sure your answers have a value.");
            if (answer.correct) {
              correct = true;
            }
          }
          if (!correct) throw new Error("Please make sure you selected the correct answer in your questions.");
          return true;
        }
        return false;
      });

      if (q.length < 1) {
        setIsLoading(false);
        throw new Error("Please make you have at least one question with minimum two answers");
      }

      const quizUID = new Date().getTime() + Math.floor(Math.random() * 2 ** 10).toString();
      await createQuiz(params.cid, { ...quiz, uid: quizUID, problems: q });
      setNotif("Quiz Created Successfully...");
      setError("");
      setIsLoading(false);
      setIsDisabled(old => {
        return { ...old, publish: true };
      });
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    }
  }

  function discardQuestion() {
    setQuiz(oldQuiz => {
      if (oldQuiz.problems.length === 1) return oldQuiz;
      return {
        ...oldQuiz,
        problems: oldQuiz.problems.filter((q, index) => {
          if (index === quizPtr) {
            return false;
          }
          return true;
        }),
      };
    });

    setQuizPtr(old => {
      if (old === 0) return old;
      return old - 1;
    });
  }

  function previousQuestion() {
    setQuizPtr(old => old - 1);
  }

  function nextQuestion() {
    setQuizPtr(old => old + 1);
  }

  return (
    <div className={classes["create-quiz"]}>
      <div className="container">
        <NotifMsg notif={notif} error={error} />
        <header className={classes["create-quiz__header"]}>
          <div>
            <h1 className={classes["create-quiz__header--main"]}>Create Quiz</h1>
            <p className={classes["create-quiz__header--sub"]}>{course.name}</p>
          </div>
          <div className={classes["quiz-actions"]}>
            <Button onClick={cancelQuizCreation}>Cancel</Button>
            <Button isLoading={isLoading} disabled={isDisabled.publish} onClick={publishQuiz}>
              Publish
            </Button>
          </div>
        </header>
        {!startBuilding && (
          <Card className={classes["create-quiz__body"]}>
            <h2 className={classes["time-pickers__header"]}>Please Select the date of quiz</h2>
            <div className={classes["time-pickers__pickers"]}>
              <div className={classes["time-pickers__from-time"]}>
                <label htmlFor="from-time">Start Time: </label>
                <DateTimePicker id="from-time" onChange={onFromDateChange} value={fromDate} />
              </div>
              <div className={classes["time-pickers__deadline-time"]}>
                <label htmlFor="deadline">Deadline: </label>
                <DateTimePicker id="deadline" onChange={onDeadlineDateChange} value={deadlineDate} />
              </div>
            </div>
            <div className={classes["quiz-actions"]}>
              <Button onClick={setQuizTime}>Start Creating Quiz</Button>
            </div>
          </Card>
        )}
        {startBuilding && (
          <Card className={classes["create-quiz__body"]}>
            {!showQuestion && <Button onClick={addQuestion}>Add Question</Button>}
            {showQuestion && (
              <div className={classes["quiz-question"]}>
                <header className={classes["quiz-question__header"]}>
                  <h2>Question #{quizPtr + 1}</h2>
                  <div className={classes["quiz-question__actions"]}>
                    <Button onClick={discardQuestion}>Discard question</Button>
                  </div>
                </header>
                <div className={classes["quiz-question__question"]}>
                  <Question onClick={editQuestion}>{quiz.problems[quizPtr].question}</Question>
                  <div className={classes["quiz-question__answers"]}>
                    {showAnswers &&
                      quiz.problems[quizPtr].answers.map((answer, index) => {
                        return (
                          <Answer
                            correct={answer.correct}
                            onCorrectCheck={onCorrectCheck}
                            onClick={editAnswer}
                            key={index}
                            index={index}
                          >
                            {answer.value}
                          </Answer>
                        );
                      })}
                    {quiz.problems[quizPtr].question && <Button onClick={addAnswer}>Add Answer</Button>}
                  </div>
                </div>
              </div>
            )}
            {showTools && (
              <div className={classes["quiz-question__actions"]}>
                <div className={classes["quiz-question__actions"]}>
                  <Button disabled={isDisabled.previous} onClick={previousQuestion}>
                    Back
                  </Button>
                  <Button disabled={isDisabled.next} onClick={nextQuestion}>
                    Next
                  </Button>
                </div>
                <div className={classes["quiz-question__actions"]}>
                  <Button disabled={isDisabled.add} onClick={addNewQuestion}>
                    Add
                  </Button>
                </div>
              </div>
            )}
            <Editor
              className={`${showQuestion ? "" : classes["show-editor"]} ${classes["editor"]}`}
              innerRef={contentRef}
              onContent={handleContent}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateQuiz;
