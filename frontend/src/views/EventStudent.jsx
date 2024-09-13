import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import {
	ref,
	onValue,
	orderByChild,
	equalTo,
	query,
	get,
} from "firebase/database";
import { app, db } from "../app/firebase";
import { fetchEvents } from "../app/features/eventSlice";

// components
import EvetnStudentLeftBar from "../components/EvetnStudentLeftBar";
import EventStudentList from "../components/EventStudentList";
import { useParams } from "react-router-dom";

const EventStudent = () => {
	const [eventsData, setEventsData] = useState([]);
	const [selectedEventPage, setSelectedEventPage] = useState([]);
	const [pageParam, setPageParam] = useState("events");
	const { events } = useSelector((state) => state.events);
	const { user } = useSelector((state) => state.user);

	const { page } = useParams();
	const dispatch = useDispatch();

	useEffect(() => {
		setEventsData(events);
	}, [events]);

	useEffect(() => {
		dispatch(fetchEvents());
	}, [dispatch, page]);

	useEffect(() => {
		switch (page) {
			case "events":
				setPageParam("events");
				break;
			case "ongoing":
				setPageParam("Ongoing");
				break;
			case "upcoming":
				setPageParam("Scheduled");
				break;
			case "accomplished":
				setPageParam("Accomplished");
				break;
			case "certificates":
				setPageParam("Certificates");
				break;
			case "account":
				setPageParam("account");
				break;
			default:
				setPageParam("events");
				break;
		}
	}, [page, events]);

	useEffect(() => {
		if (!user) {
			return;
		}
		if (!eventsData || eventsData.length < 1) {
			return;
		}

		if (!Array.isArray(eventsData)) {
			location.reload();
		}

		const fetchAttendance = async () => {

			if(pageParam == 'Certificates'){
				setSelectedEventPage([])
				return
			}

			if(pageParam == 'account'){
				setSelectedEventPage([])
				return
			}

			if (pageParam != "events") {
				const filteredEvent = eventsData.filter(
					(event) => event?.status?.toLowerCase() === pageParam?.toLowerCase()
				);
				setSelectedEventPage(filteredEvent);
				return;
			} else {
				const eventsArr = [];
				for (const event of eventsData) {
					const attendanceRef = ref(db, "attendance");
					const attendanceQuery = query(
						attendanceRef,
						orderByChild("eventId"),
						equalTo(event.uid)
					);

					const attendanceSnapshot = await get(attendanceQuery);

					if (attendanceSnapshot.exists()) {
						const attendance = attendanceSnapshot.val();
						const userId = user.uid;
						const events = Object.values(attendance);

						const attendanceMade = events.find(
							(event) => event.userId === userId
						);

						if (attendanceMade) {
							const attendedEvent = eventsData.find(
								(event) => event.uid === attendanceMade.eventId
							);

							if (attendedEvent) {
								eventsArr.push(attendedEvent);
							}
						}
					}
				}

				setSelectedEventPage(eventsArr);
			}
		};

		fetchAttendance();
	}, [eventsData, pageParam, user]);

	return (
		<Container>
			<EvetnStudentLeftBar />
			<EventStudentList events={selectedEventPage} pageParam={pageParam} />
		</Container>
	);
};

export default EventStudent;

const Container = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: 20vw 50vw;
	gap: 10%;

	@media (max-width: 768px) {
		height: auto;
		width: 100vw;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
		gap: 1em;
	}
`;
