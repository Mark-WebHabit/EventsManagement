import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { handleGetAuthUser } from "../app/features/userSlice";
import { fetchSingleEvent } from "../app/features/eventSlice";
import { app, db } from "../app/firebase";
import {
	equalTo,
	get,
	orderByChild,
	push,
	query,
	ref,
	set,
} from "firebase/database";
import { format } from "date-fns";

const ProcessAttendance = () => {
	const [fetchingUser, setFetchingUser] = useState(true); // Initialize as true to show loading state initially
	const [fetchingOtherData, setFetchingOtherData] = useState(true);

	const { uid } = useParams();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { user } = useSelector((state) => state.user);

	const [message, setMessage] = useState("");
	const [timeIn, setTimeIn] = useState("");
	const [attended, setAttended] = useState(true);
	const [isAnnalyzing, setIsAnnalyzing] = useState(true);

	useEffect(() => {
		if (!uid) {

			alert('Event Not Found');
			navigate("/404");
			return;
		}

		const auth = getAuth(app);

		// Listen for auth state changes
		const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
			if (authUser) {
				try {
					await dispatch(handleGetAuthUser());
				} catch (error) {
					console.log(error.message);
				}
			} else {
				navigate("/login");
			}

			setFetchingUser(false);
		});

		return () => unsubscribe(); // Cleanup the listener on unmount
	}, []);

	useEffect(() => {
		if (!user || !user?.uid) {
			return;
		} else {
			processAttendace();
		}

		async function processAttendace() {
			const attendanceRef = ref(db, "attendance");
			const attendanceQuery = query(
				attendanceRef,
				orderByChild("eventId"),
				equalTo(uid)
			);
			try {
				// fetch event
				const event = await dispatch(fetchSingleEvent(uid));

				if (!event || !event?.payload) {

					alert('event not found');
					navigate("/404");
					return;
				}

				// check if user already made the attendance

				const attendanceSnapshot = await get(attendanceQuery);

				const attendance = attendanceSnapshot.val();
				if (attendance) {
					const hasAttended = Object.values(attendance).find(
						(attendee) => attendee.userId === user?.uid
					);
					if (hasAttended) {
						setAttended(true);
						setMessage("You have already done your attendance for this event");
						setTimeIn(hasAttended.timeIn);
						return;
					} else {
						setAttended(false);
					}
				} else {
					setAttended(false);
				}

				// check event status
				const status = event.payload.status;

				if (status.toLowerCase() === "scheduled") {
					setMessage("The event is not yet underway.");
					return;
				}
				if (status.toLowerCase() === "accomplished") {
					setMessage("The event has already ended.");
					return;
				}
				if (status.toLowerCase() === "ongoing") {
					const isOpen = event.payload.openAttendance;

					if (!isOpen) {
						setMessage("The attendance is already closed.");
						return;
					}else{
                        setIsAnnalyzing(false);
                    }
				}
			} catch (error) {
				console.log(error.message);
			} finally {
				setFetchingOtherData(false);
			}
		}
	}, [user, navigate, dispatch, uid]);

	useEffect(() => {
		if (!attended && !isAnnalyzing) {
			(async () => {
				const attendanceRef = ref(db, "attendance");
				// process attendance here
				const t = new Date().toISOString();
				const newAttendance = {
					timeIn: t,
					userId: user.uid,
					eventId: uid,
				};
				const newAttendanceRef = push(attendanceRef);
				await set(newAttendanceRef, newAttendance);
				setMessage("Attendance recorded!");
				setTimeIn(t);
			})();
		}
	}, [attended, isAnnalyzing]);

	if (fetchingUser || fetchingOtherData) {
		return <Loading>Loading...</Loading>; // Show a loading state while fetching user data
	}

	if (!user) {
		navigate("/");
		return null; // Render nothing if the user is not found
	}

	const formattedTimeIn = timeIn
		? format(new Date(timeIn), "MMMM d, yyyy h:mma")
		: "";

	return (
		<Container>
			<Modal>
				<Message>{message}</Message>
				{timeIn && <TimeIn>Time In: {formattedTimeIn}</TimeIn>}
				<BackButton onClick={() => navigate(-1)}>Back</BackButton>
			</Modal>
		</Container>
	);
};

export default ProcessAttendance;

const Container = styled.div`
	height: 100vh;
	width: 100vw;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: rgba(0, 0, 0, 0.5);
`;

const Loading = styled.h1`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

const Modal = styled.div`
	background: white;
	padding: 2rem;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	max-width: 400px;
	text-align: center;
`;

const Message = styled.p`
	font-size: 1.5rem;
	margin-bottom: 1rem;
`;

const TimeIn = styled.p`
	font-size: 1.2rem;
	margin-bottom: 2rem;
`;

const BackButton = styled.button`
	padding: 0.5rem 1rem;
	font-size: 1rem;
	color: white;
	background-color: #007bff;
	border: none;
	border-radius: 4px;
	cursor: pointer;

	&:hover {
		background-color: #0056b3;
	}
`;
