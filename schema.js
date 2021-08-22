export const USERS = [
  {
    id: 1,
    name: "Abner",
    authInfo: "REGISTERED STUDENT/TEACHER", //REFERENCE TO THE AUTH COLLECTION (I STORE emails and passwords in the cloud handleded by firebase,
    //if my db is compromised user emails and passwords won't be leaked...).
    isTeacher: false,
    feedback: {
      complete: true,
      satisfaction: 5,
      interface: 5,
      comment: "You rock!",
    },
    //forTeachers
    pendingEnrollments: [
      {
        course: "COURSEID",
        user: {
          "userID",
          "userName",
        },
      },
    ],
    courses: [
      {
        id: 1,
        enrolled: false,
        courseID: COURSES[0].id, //course id
        feedback: {
          complete: true,
          rating: 5, //out of 5
          comment: "YOu ROCK!",
        },
        takenQuizzes: [
          {
            //will basically copy the quiz to the user's taken quizzes per course
            id: 1,
            quizID: 1,
            complete: true,
            startTime: "01/03/2021 11:30",
            deadline: "01/03/2021 17:30", //if exceeded deadline... mark is 0.
            instantFeedback: false,
            mark: 10, //overall grade (by question number) (I may get a percentage out of it)
            totalMark: 15, //based on the number of questions...
            timeFrame: 1800, //30 minutes timeframe for the whole quiz... can be set to infinity...
            //if we wanna rely on the question time instead...
            questions: [
              {
                id: 1,
                time: 90, //90 seconds timeframe for this question.
                correct: false, //correct question or not..
                question: "FORMATED using a lib------> What is the type of the following equation: e^x ?",
                answers: [
                  {
                    answer: "Differential",
                    correct: true, //can have multiple true answers...
                    selected: false,
                  },
                  {
                    answer: "Exponential",
                    correct: false,
                    selected: true, //TODO: selected answer by user......
                  },
                  {
                    answer: "Logarithmic",
                    correct: true,
                    selected: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

//Courses schema
export const COURSES = [
  {
    id: 1,
    name: "Engineering Mathematics",
    code: "MATH254",
    courseComplete: false, //if course is complete it'll be archieved... Only teacher is able to mark course as complete
    //if for example june session is finished, then teacher can mark the course as complete...
    teacher: TEACHERS[0].id, //I'll add the teacher's id here, so it refers to the teacher collection aka table.
    quizzes: [
      //I'd like to add the quizzes in the courses table.
      //I don't want to extract it in its own table because it will cost me 2 requests instead of one.
      {
        id: 1,
        startTime: "01/03/2021 11:30",
        deadline: "01/03/2021 17:30", //if exceeded deadline... mark is 0.
        instantFeedback: false, // lama n7el so2al, el egaba tb2a lonha a5dr aw a7mr 3la 7sb s7 aw 8lt...
        // law instantFeedback: false mesh hn3rf el egaba s7 wla 8lt (3lshan mn8asheshh s7abna w keda...).
        timeFrame: 1800, //30 minutes timeframe for the whole quiz... can be set to infinity...
        //if we wanna rely on the question time instead...
        totalMark: 15, //based on the number of questions...
        questions: [
          {
            id: 1,
            time: 90, //90 seconds timeframe for this question.
            question: "FORMATED using a lib------> What is the type of the following equation: e^x ?",
            answers: [
              {
                answer: "Differential",
                correct: true, //can have multiple true answers...
              },
              {
                answer: "Exponential",
                correct: false,
              },
              {
                answer: "Logarithmic",
                correct: true,
              },
            ],
          },
        ],
      },
    ],
  },
];
