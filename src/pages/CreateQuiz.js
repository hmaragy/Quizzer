import classes from "./CreateQuiz.module.css";

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useCourses } from "../store/CoursesContext";

import Card from "../components/ui/Card";
import Button from "../components/ui/FormButton";
import NotifMsg from "../components/NotifMsg";

import Editor from "../components/Editor";

const Answer = props => {
  function emitChildren() {
    return props.onClick(props.children, props.i);
  }

  return (
    <div className={classes["quiz-question__answer"]}>
      <input type="radio" name="answer" />
      <label
        htmlFor="answer"
        value={props.value}
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

const CreateQuiz = props => {
  const params = useParams();
  const [quiz, setQuiz] = useState([]);
  const [quizPtr, setQuizPtr] = useState(0);

  const [isDisabled, setIsDisabled] = useState([{ next: true, previous: false }]);

  const [course, setCourse] = useState([]);
  const [error, setError] = useState("");

  const [showQuestion, setShowQuestion] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showTools, setShowTools] = useState(false);

  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);

  const [currentlyEditing, setCurrentlyEditing] = useState({ type: "question" });

  const contentRef = useRef();

  const { user } = useAuth();
  const { getCourse } = useCourses();

  function addQuestionToQuiz() {
    if (!question || !answers.length > 1) {
      return;
    }
    setQuizPtr(quiz.length + 1);
    setQuiz(oldQuiz => {
      return [
        ...oldQuiz,
        {
          question: question,
          answers: answers,
          time: 180,
        },
      ];
    });

    setQuestion("");
    setAnswers([]);
    setCurrentlyEditing({ type: "question" });
    setShowAnswers(false);
    contentRef.current.editor.setContent("");
  }

  function addQuestion() {
    setShowQuestion(true);
  }

  function addAnswer() {
    setShowAnswers(true);
    if (answers.length > 0) {
      if (!answers[answers.length - 1].value) {
        return;
      }
    }
    setAnswers(oldAnswers => {
      return [
        ...oldAnswers,
        {
          value: null,
          correct: false,
        },
      ];
    });
    setCurrentlyEditing({ type: "answer", i: answers.length });

    if (answers.length >= 1) {
      setShowTools(true);
    }

    contentRef.current.editor.setContent("");
  }

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

  function handleContent(content) {
    if (currentlyEditing.type === "question") {
      setQuestion(content);
    } else {
      setAnswers(oldAnswers => {
        return oldAnswers.map((a, i) => {
          if (i === currentlyEditing.i) {
            return { value: content, correct: false };
          }
          return a;
        });
      });
    }
  }

  function editQuestion(question) {
    contentRef.current.editor.setContent(question);
    setCurrentlyEditing({ type: "question" });
  }

  function editAnswer(value, index) {
    setCurrentlyEditing({ type: "answer", i: index });
    contentRef.current.editor.setContent(value);
  }

  useEffect(() => {
    console.log("QUIZPTR", quizPtr);
    if (quiz.length < 1) {
      setIsDisabled(oldState => {
        return { ...oldState, previous: true, next: true };
      });
    } else if (quizPtr === 0) {
      setIsDisabled(oldState => {
        return { ...oldState, previous: true, next: false };
      });
    } else if (quizPtr === quiz.length) {
      setIsDisabled(oldState => {
        return { ...oldState, next: true, previous: false };
      });
    } else {
      setIsDisabled(oldState => {
        return { ...oldState, next: false, previous: false };
      });
    }
  }, [quiz.length, quizPtr]);

  function previousQuestion() {
    setQuizPtr(oldPTR => {
      return oldPTR - 1;
    });
  }

  function nextQuestion() {
    setQuizPtr(oldPTR => {
      return oldPTR + 1;
    });
  }

  return (
    <div className={classes["create-quiz"]}>
      <div className="container">
        <NotifMsg error={error} />
        <header className={classes["create-quiz__header"]}>
          <div>
            <h1 className={classes["create-quiz__header--main"]}>Create Quiz</h1>
            <p className={classes["create-quiz__header--sub"]}>{course.name}</p>
          </div>
          <div className={classes["quiz-actions"]}>
            <Button>Cancel</Button>
            <Button>Publish</Button>
          </div>
        </header>
        <Card className={classes["create-quiz__body"]}>
          {!showQuestion && <Button onClick={addQuestion}>Add Question</Button>}
          {showQuestion && (
            <div className={classes["quiz-question"]}>
              <header className={classes["quiz-question__header"]}>
                <h2>Question #{quiz.length + 1}</h2>
                <div className={classes["quiz-question__actions"]}>
                  <Button>Discard question</Button>
                </div>
              </header>
              <div className={classes["quiz-question__question"]}>
                <Question onClick={editQuestion}>{question}</Question>
                <div className={classes["quiz-question__answers"]}>
                  {showAnswers &&
                    answers.map((answer, index) => {
                      return (
                        <Answer onClick={editAnswer} key={index} i={index}>
                          {answer.value}
                        </Answer>
                      );
                    })}
                  {question && <Button onClick={addAnswer}>Add Answer</Button>}
                </div>
              </div>
              <Editor innerRef={contentRef} onContent={handleContent} />
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
                <Button onClick={addQuestionToQuiz}>Add</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreateQuiz;
