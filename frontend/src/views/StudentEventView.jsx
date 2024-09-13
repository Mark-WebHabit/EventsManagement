import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleEvent } from "../app/features/eventSlice.js";
import { equalTo, get, orderByChild, query, ref } from "firebase/database";
import { db } from "../app/firebase.js";

import ErrorModal from "../components/ErrorModal.jsx";

const StudentEventView = () => {
	const [event, setEvent] = useState(null);
	const [loading, setLoading] = useState(true);
	const [hasEvaluation, setHasEvaluation] = useState(false);
	const [hasResponseAlready, setHasResponseAlready] = useState(false);
	const [errorMesage, setErrorMessage] = useState(null);

	const { uid } = useParams();
	const { user } = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		if (!uid) {
			return;
		}

		(async () => {
			setLoading(true);
			const data = await dispatch(fetchSingleEvent(uid));

			if (data.payload) {
				setEvent(data.payload);

				const evalRef = ref(db, `evaluation/${uid}`);

				const evalSnap = await get(evalRef);

				if (evalSnap.exists()) {
					const evaluation = evalSnap.val();

					if (evaluation.release) {
						setHasEvaluation(true);

						// check if the suer already answered the evaluation
						const responsesRef = ref(db, "responses");
						const responsesQeury = query(
							responsesRef,
							orderByChild("evaluationId"),
							equalTo(uid)
						);

						const responseSnapshot = await get(responsesQeury);

						if (responseSnapshot.exists()) {
							const reponses = responseSnapshot.val();

							const responsesValues = Object.values(reponses);

							const isTrue = responsesValues.find(
								(resp) => resp.userId == user.uid
							);

							if (!isTrue || isTrue == undefined) {
								setHasResponseAlready(false);
							} else {
								setHasResponseAlready(true);
							}
						}
					} else {
						setHasEvaluation(false);
					}
				} else {
					setHasEvaluation(false);
				}
			} else {
				setEvent(null);
			}

			setLoading(false);
		})();
	}, [uid]);

	if (!loading && !event)
		return <LoadingContainer>No Event Found</LoadingContainer>;
	if (loading || !event) return <LoadingContainer>Loading...</LoadingContainer>;

	const handleBackClick = () => {
		navigate('/student/events');
	};

	const calculateDuration = (start, end) => {
		const startDate = new Date(start);
		const endDate = new Date(end);
		const duration = (endDate - startDate) / 1000 / 60 / 60;
		return duration.toFixed(2); // Ensure duration is formatted to two decimal places
	};

	const handleAnswerEvalButtonClick = async () => {
		// check if has attendance to know if elligible for evaluation
		try {
			const attendanceRef = ref(db, `attendance`);
			const attendanceQuery = query(
				attendanceRef,
				orderByChild("eventId"),
				equalTo(uid)
			);
			
			const attendanceSnapshot = await get(attendanceQuery)
			
			if (attendanceSnapshot.exists()) {
				const eventAttendace = attendanceSnapshot.val()

				const eventdata = Object.values(eventAttendace)


				const isElegibleForEval = eventdata.find((student) => student.userId == user.uid )

				if(!isElegibleForEval){
					setErrorMessage(
						"Since your name is not in the attendance record, you are not qualified to respond to the evaluation."
					);
					return
				}


				if (!hasEvaluation && !hasResponseAlready) {
					setErrorMessage(
						"The evaluation of the event is either closed or has not yet been made public."
					);
				} else if (hasEvaluation && !hasResponseAlready) {
					navigate(`/student/eval/${uid}`);
				} else {
					navigate(`/student/eval/${uid}/${user.uid}`);
				}
			}else{
				setErrorMessage(
					"Since your name is not in the attendance record, you are not qualified to respond to the evaluation."
				);
				return;
			}
		} catch (error) {
			console.log(error);
			setErrorMessage(error.message);
		}
	};

	return (
		<Container>
			<Wrapper>
				<BackButton onClick={handleBackClick}>Back</BackButton>
				<EventPictureContainer>
					{/* <a href={event.picture} download>
						<EventPicture src={event.picture} alt="Template" />
					</a> */}
					<QRCodeContainer>
						<QRCodeSVG
							value={`${import.meta.env.VITE_BASE_URL}attendance/event/${uid}`}
						/>
					</QRCodeContainer>
					<QRLink onClick={() => navigate(`/attendance/event/${uid}`)}>
						follow this link
					</QRLink>
				</EventPictureContainer>
				<EventContent>
					<EventTitle>{event.title}</EventTitle>
					<EventDescription>{event.description}</EventDescription>
					<EventDetails>
						<EventDateTime>
							Start: {new Date(event.startDateTime).toLocaleString()}
						</EventDateTime>
						<EventDateTime>
							End: {new Date(event.endDateTime).toLocaleString()}
						</EventDateTime>
						<EventDuration>
							Duration:{" "}
							{calculateDuration(event.startDateTime, event.endDateTime)} Hours
						</EventDuration>
						<EventStatus>Status: {event.status}</EventStatus>
					</EventDetails>
				</EventContent>

				<Button
					$releasedEval={hasEvaluation}
					onClick={() => handleAnswerEvalButtonClick(hasResponseAlready)}
				>
					{!hasResponseAlready ? "Answer Evaluation" : "See Response"}
				</Button>
			</Wrapper>

			{errorMesage && (
				<ErrorModal
					message={errorMesage}
					onClose={() => setErrorMessage(null)}
				/>
			)}
		</Container>
	);
};

export default StudentEventView;

const Container = styled.div`
	display: grid;
	place-items: center;
	padding: 1em;
	background-color: #f0f0f0;
`;

const LoadingContainer = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 2rem;
	color: #333;
`;

const Wrapper = styled.div`
	background-color: #fff;
	padding: 2em;
	border-radius: 8px;
	box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
	max-width: 600px;
	width: 100%;
	max-height: 80vh;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	align-items: center;

	@media (max-width: 468px) {
		padding: 1em;
		border-radius: 0;
	}
`;

const BackButton = styled.button`
	background: #f44336;
	color: #fff;
	border: none;
	padding: 0.5em 1em;
	border-radius: 4px;
	cursor: pointer;
	align-self: flex-start;
	margin-bottom: 1em;

	&:hover {
		background: #d32f2f;
	}
`;

const EventPictureContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const EventPicture = styled.img`
	max-width: 100px;
	border-radius: 8px;
	margin-bottom: 1em;

	@media (max-width: 468px) {
		max-width: 80px;
	}
`;

const QRCodeContainer = styled.div`
	margin-top: 1em;
	cursor: pointer;

	&:hover {
		transform: scale(1.1);
		transition: transform 0.2s;
	}
`;

const EventContent = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	margin-bottom: 1em;
`;

const EventTitle = styled.h1`
	margin: 0 0 1em 0;
	font-size: 1.5em;
	color: #333;
`;

const EventDescription = styled.p`
	margin: 0 0 1em 0;
	color: #666;
`;

const EventDetails = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5em;
	width: 100%;
	margin-bottom: 1em;
`;

const EventDateTime = styled.span`
	font-size: 0.9em;
	color: #555;
`;

const EventDuration = styled.span`
	font-size: 0.9em;
	color: #555;
`;

const EventStatus = styled.span`
	font-size: 0.9em;
	color: #555;
`;

const Button = styled.button`
	padding: 1em 2.5em;
	border: none;
	border-radius: 0.5em;
	background-color: ${(props) => (props.$releasedEval ? "#008000" : "#d9d9d9")};
	font-weight: bold;
	cursor: pointer;
	color: ${(props) => (props.$releasedEval ? "#fff" : "#000")};
`;

const QRLink = styled.small`
	color: blue;
	text-decoration: underline;
	cursor: pointer;
`;
