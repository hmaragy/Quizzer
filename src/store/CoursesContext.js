import React, { useContext, useEffect, useState } from "react";
import { db, f } from "../firebase";
import { useAuth } from "./AuthContext";

const CoursesContext = React.createContext(undefined);

export function useCourses() {
  return useContext(CoursesContext);
}

export function CoursesProvider({ children }) {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    (async () => {
      if (user.user) {
        const userInfo = await getUserInfo(user.user.uid);
        setUserInfo(userInfo);
      }
    })();
  }, [user]);

  async function getUserInfo(uid, id) {
    try {
      let querySnapshot = await db.collection("users").where("uid", "==", uid).get();
      if (!querySnapshot.empty) {
        if (!id) {
          return querySnapshot.docs[0].data();
        } else {
          return [querySnapshot.docs[0].data(), querySnapshot.docs[0].id];
        }
      } else {
        throw new Error("user info not found", { type: "no-data" });
      }
    } catch (error) {
      switch (error.type) {
        case "no-data":
          throw new Error(error.message);
        default:
          console.log(error);
          throw new Error("Error getting your info, please try again later.");
      }
    }
  }

  async function updateUserInfo() {
    if (user?.user?.uid) {
      let userInfo = await getUserInfo(user.user.uid);
      setUserInfo(userInfo);
    }
  }

  async function getCourses() {
    try {
      const userInfo = await getUserInfo(user.user.uid);
      setUserInfo(userInfo);
      if (userInfo && userInfo.isTeacher) {
        let querySnapshot = await db.collection("courses").where("teacher", "==", user.user.uid).get();
        if (!querySnapshot.empty) {
          let courses = [];
          querySnapshot.forEach(doc => {
            courses.push({ cid: doc.id, ...doc.data() });
          });

          return courses;
        } else {
          return [];
        }
      } else if (userInfo && !userInfo.isTeacher) {
        return userInfo.courses;
      }
    } catch (error) {
      throw error;
    }
  }

  async function getCourse(cid) {
    try {
      let querySnapshot = await db.collection("courses").where("cid", "==", cid).get();
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      } else {
        const error = new Error("Course not found");
        error.type = "NOT-FOUND";
        throw error;
      }
    } catch (error) {
      if (error.type === "NOT-FOUND") throw error;
      else throw new Error("Please reload the page and try again.");
    }
  }

  async function enrollToCourse(courseId) {
    try {
      //checks my courses if I am not yet enrolled. if enrolled, then throw error
      const [userInfo, userDoc] = await getUserInfo(user.user.uid, true);

      if (userInfo && userInfo.courses?.length) {
        userInfo.courses.forEach(c => {
          if (c.cid === courseId) {
            const error = new Error("User is already enrolled to course");
            error.type = "custom";
            throw error;
          }
        });
      }

      //Check if course is found and add it to the user's courses...
      const querySnapshot = await db.collection("courses").where("cid", "==", courseId).get();
      const resultCourse = querySnapshot.docs[0]?.data();
      if (resultCourse && resultCourse.teacher) {
        const userRef = await db.collection("users").doc(userDoc);
        await userRef.update({
          courses: f.firestore.FieldValue.arrayUnion({
            ...resultCourse,
          }),
        });
      } else {
        const error = Error("Course not found, make sure you entered everything correctly.");
        error.type = "custom";
        throw error;
      }
    } catch (error) {
      if (error.type === "custom") {
        throw error;
      } else {
        console.log(error);
        throw new Error("Please refresh the page and try again later.");
      }
    }
  }

  async function createCourse(name, code) {
    try {
      const uid = user.user.uid;
      const course = {
        name,
        code,
        teacher: uid,
      };

      const courseRef = await db.collection("courses").add(course);
      const cid = courseRef.id;
      await courseRef.update({ cid });
      return cid;
    } catch (error) {
      throw new Error("Something went wrong, please refresh and try again.");
    }
  }

  async function createQuiz(cid, quiz) {
    try {
      const courseRef = await db.collection("courses").doc(cid);
      await courseRef.update("quizzes", f.firestore.FieldValue.arrayUnion({ ...quiz }));
    } catch (error) {
      console.log(error);
      throw new Error("Something went wrong, please try again later...");
    }
  }

  async function getQuizzes(cid) {
    try {
      const course = await getCourse(cid);
      if (!userInfo.isTeacher) {
        const [userInfo, userDoc] = await getUserInfo(user.user.uid, true);

        const userCourseIndex = userInfo.courses.findIndex(course => {
          if (course.cid === cid) {
            return true;
          }
          return false;
        });

        const userCourse = userInfo.courses[userCourseIndex];

        if (!course.quizzes) return [];
        let updated = false;
        course.quizzes.forEach(quiz => {
          const uid = quiz.uid;
          let checkFlag = false;

          if (!userCourse?.quizzes) userCourse.quizzes = [];
          userCourse.quizzes.forEach((userQuiz, index) => {
            if (userQuiz.uid === uid) {
              checkFlag = true;
            }

            if (new Date(+userQuiz.deadlineDate) < new Date() && !userQuiz.complete) {
              userInfo.courses[userCourseIndex].quizzes[index].complete = true;
              userInfo.courses[userCourseIndex].quizzes[index].taken = false;
              userInfo.courses[userCourseIndex].quizzes[index].grade = 0;
              updated = true;
            }
          });

          if (!checkFlag) {
            const q = { ...quiz };
            if (new Date(q.deadlineDate) < new Date()) {
              q.complete = true;
              q.taken = false;
              q.grade = 0;
            }
            userInfo.courses[userCourseIndex].quizzes.push(q);
            updated = true;
          }
        });

        if (updated) {
          const userRef = await db.collection("users").doc(userDoc);
          //very dirty :v
          await userRef.update({ courses: userInfo.courses });
        }
        return userInfo.courses[userCourseIndex].quizzes;
      } else {
        return course.quizzes || [];
      }
    } catch (error) {
      console.log(error);
      throw new Error("Something went Wrong, Please reload the page and try again.");
    }
  }

  async function submitQuiz(quiz, cid) {
    try {
      const [userInfo, userDoc] = await getUserInfo(user.user.uid, true);
      const userRef = await db.collection("users").doc(userDoc);
      userInfo.courses = userInfo.courses.map(course => {
        if (course.cid === cid) {
          let courseQuiz = course.quizzes.findIndex(q => {
            if (q.uid === quiz.uid) {
              return true;
            }
            return false;
          });

          if (courseQuiz < 0) throw new Error("Quiz not found, please reload the page and try again");

          course.quizzes[courseQuiz] = quiz;

          return course;
        }

        return course;
      });

      await userRef.update({
        courses: userInfo.courses,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  const value = {
    // changeEnrollmentStatus,
    createCourse,
    enrollToCourse,
    getCourses,
    getCourse,
    createQuiz,
    getQuizzes,
    submitQuiz,
    updateUserInfo,
    userInfo,
  };
  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
}
