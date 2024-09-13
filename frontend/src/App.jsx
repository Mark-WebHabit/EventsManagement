import { useState } from "react";

import Register from "./views/Register";
import Login from "./views/Login";
import RegisterAdmin from "./views/RegisterAdmin";
import Dashboard from "./views/Dashboard";
import Events from "./views/Events";
import EventDetails from "./views/EventDetails";
import EvaluationForm from "./views/EvaluationForm";
import NotFound from "./views/NotFound";
import EventStudent from "./views/EventStudent";
import StudentEventView from "./views/StudentEventView";
import AnswerEvaluation from "./views/AnswerEvaluation";
import ProcessAttendace from "./views/ProcessAttendace";
import SeeResponse from "./views/SeeResponse";
// layout
import Auth from "./layout/Auth";
import Admin from "./layout/Admin";
import Student from "./layout/Student";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
		<Router>
			<Routes>
				{/* auth pages */}
				<Route path="/" Component={Auth}>
					<Route path="/" Component={Login} />
					<Route path="login" Component={Login} />
					<Route path="register" Component={Register} />
					<Route path="register-admin" Component={RegisterAdmin} />
				</Route>

				{/* admin pages */}
				<Route path="/admin" Component={Admin}>
					<Route index path="" Component={Dashboard} />
					<Route index path="dashboard" Component={Dashboard} />
					<Route index path="events" Component={Events} />
					<Route index path="events/:id" Component={EventDetails} />
					<Route index path="event/evaluation/:id" Component={EvaluationForm} />
				</Route>

				<Route path="/student" Component={Student}>
					<Route index path="" Component={EventStudent} />
					<Route path="view/:uid" Component={StudentEventView} />
					<Route path=":page" Component={EventStudent} />
					<Route path="eval/:uid" Component={AnswerEvaluation} />
					<Route path="eval/:uid/:userId" Component={SeeResponse} />
				</Route>

				<Route path="/attendance/event/:uid" Component={ProcessAttendace} />

				{/* 404 */}
				<Route path="*" Component={NotFound} />
			</Routes>
		</Router>
	);
}

export default App;
