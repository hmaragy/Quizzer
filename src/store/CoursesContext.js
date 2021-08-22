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
      }
    } catch (error) {
      throw error;
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

      //Check if course is found and add it to pending enrollments on teacher's course aka notifications.
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

  const value = {
    // changeEnrollmentStatus,
    createCourse,
    enrollToCourse,
    getCourses,
    getCourse,
    userInfo,
  };
  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
}
