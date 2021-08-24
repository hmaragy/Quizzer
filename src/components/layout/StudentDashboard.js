import Course from "../Course";

const StudentDashboard = props => {
  return (
    <>
      {props.courses &&
        props.courses.map(course => {
          return <Course name={course.name} cid={course.cid} key={course.cid} code={course.code} />;
        })}
    </>
  );
};

export default StudentDashboard;
