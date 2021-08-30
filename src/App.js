import { Redirect, Route, Switch } from "react-router-dom";
import Nav from "./components/layout/Nav";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import Enroll from "./pages/Enroll";

import { useAuth } from "./store/AuthContext";
import CreateCourse from "./pages/CreateCourse";
import CreateQuiz from "./pages/CreateQuiz";
import Test from "./pages/Test";
import SolveQuiz from "./pages/SolveQuiz";

function App() {
  const { user } = useAuth();

  return (
    <>
      <Nav />
      <Switch>
        {/* there's no homepage currently so it goes to dashboard too... */}
        <Route path="/" exact>
          {user.isLoggedIn ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
        </Route>
        <Route path="/dashboard">{user.isLoggedIn ? <Dashboard /> : <Redirect to="/login" />}</Route>
        <Route path="/courses/enroll">{user.isLoggedIn ? <Enroll /> : <Redirect to="/login" />}</Route>
        <Route path="/courses/create">{user.isLoggedIn ? <CreateCourse /> : <Redirect to="/login" />}</Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Signup />
        </Route>
        <Route path="/logout">
          <Logout />
        </Route>
        <Route path="/test">
          <Test />
        </Route>
        <Route path="/courses/:cid/create-quiz">
          <CreateQuiz />
        </Route>
        <Route path="/courses/:cid/quizzes/:qid">
          <SolveQuiz />
        </Route>
      </Switch>
    </>
  );
}

export default App;
