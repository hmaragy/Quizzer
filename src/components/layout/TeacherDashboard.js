import { useHistory } from "react-router-dom";
import Course from "../Course";

const TeacherDashboard = props => {
  const history = useHistory();

  function onCreateQuizClick(courseName, courseId, courseCode) {
    history.push({
      pathname: `/courses/${courseId}/create-quiz`,
      state: {
        name: courseName,
        code: courseCode,
        cid: courseId,
      },
    });
  }
  return (
    <>
      {props.courses &&
        props.courses.map(course => {
          return (
            <Course
              teacher
              onCreateQuizClick={onCreateQuizClick}
              name={course.name}
              quizzes={course.quizzes}
              key={course.cid}
              cid={course.cid}
              code={course.code}
            />
          );
        })}
    </>
  );
};

export default TeacherDashboard;
