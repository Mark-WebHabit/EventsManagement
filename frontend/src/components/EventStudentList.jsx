import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDatabase, ref, child, get } from "firebase/database";

import NotificationCertificate from "./NotificationCertificate";
import EventContainerWrapper from "./EventContainerWrapper";
import AccountForm from "./AccountForm";

const EventStudentList = ({ events, pageParam }) => {
	const [selectedImage, setSelectedImage] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filter, setFilter] = useState("");
	const [certificates, setCertificates] = useState([]);
	const { page } = useParams();
	const { user } = useSelector((state) => state.user);
	const navigate = useNavigate();

	useEffect(() => {
		if (page === "certificates") {
			fetchCertificates();
		}
	}, [page]);

	const fetchCertificates = async () => {
		const dbRef = ref(getDatabase());
		try {
			const snapshot = await get(child(dbRef, "certificates"));
			if (snapshot.exists()) {
				const certs = snapshot.val();
				const userCerts = Object.values(certs).filter(
					(cert) => cert.userId === user.uid
				);
				const eventPromises = userCerts.map((cert) =>
					get(child(dbRef, `events/${cert.eventId}`))
				);
				const eventSnapshots = await Promise.all(eventPromises);
				const eventsData = eventSnapshots.map((snap) => snap.val());
				const certsWithEventData = userCerts.map((cert, index) => ({
					...cert,
					event: eventsData[index],
				}));
				setCertificates(certsWithEventData);
			}
		} catch (error) {
			console.error("Error fetching certificates:", error);
		}
	};

	const handleImageClick = (src) => {
		setSelectedImage(src);
	};

	const closeModal = () => {
		setSelectedImage(null);
	};

	const handleEventClick = (uid) => {
		navigate(`/student/view/${uid}`);
	};

	const handleSearchChange = (e) => {
		setSearchQuery(e.target.value);
	};

	const handleFilterChange = (e) => {
		setFilter(e.target.value);
	};

	const filteredEvents = events.filter((event) => {
		const matchesSearch = event.title
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesFilter =
			pageParam !== "events" ||
			filter === "" ||
			event.status.toLowerCase() === filter.toLowerCase();
		return matchesSearch && matchesFilter;
	});

	if (page === "certificates") {
		return (
			<Container>
				{certificates.length > 0 ? (
					certificates.map((cert, index) => (
						<NotificationCertificate cert={cert} index={index} key={index} />
					))
				) : (
					<NoNotification>No certificates found...</NoNotification>
				)}
			</Container>
		);
	}

	if (page === "account") {
		return (
			<Container>
				<AccountForm />
			</Container>
		);
	}

	return (
		<>
			<Container>
				{!events || (events.length < 1 && <NoEvent>No event found...</NoEvent>)}
				{events && events.length > 0 && (
					<FilterContainer>
						<Search
							placeholder="Search for event name..."
							value={searchQuery}
							onChange={handleSearchChange}
						/>
						{pageParam === "events" && (
							<Filter value={filter} onChange={handleFilterChange}>
								<option value="">All</option>
								<option value="ongoing">Ongoing</option>
								<option value="accomplished">Accomplished</option>
							</Filter>
						)}
					</FilterContainer>
				)}
				{filteredEvents.length > 0
					? filteredEvents.map((event) => (
							<EventContainerWrapper
								event={event}
								handleEventClick={handleEventClick}
								handleImageClick={handleImageClick}
								key={event.uid}
							/>
					  ))
					: events.length > 0 && (
							<NoEvent>No event matches the criteria...</NoEvent>
					  )}
			</Container>
			{selectedImage && (
				<Modal onClick={closeModal}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<ModalImage src={selectedImage} alt="Event" />
						<CloseButton onClick={closeModal}>Close</CloseButton>
					</ModalContent>
				</Modal>
			)}
		</>
	);
};

export default EventStudentList;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1em;
	padding: 1em;
	position: relative;

	@media (max-width: 768px) {
		width: 100vw;
	}
`;

const NoEvent = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-size: 2rem;
	width: 90%;
	text-align: center;

	@media (max-width: 468px) {
		font-size: 1.3rem;
	}
`;

const Modal = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
`;

const ModalContent = styled.div`
	background: #fff;
	padding: 1em;
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1em;
	position: relative;
`;

const ModalImage = styled.img`
	max-width: 100%;
	min-width: 200px;
	height: auto;
	border-radius: 8px;
`;

const CloseButton = styled.button`
	background: #f44336;
	color: #fff;
	border: none;
	padding: 0.5em 1em;
	border-radius: 4px;
	cursor: pointer;
	position: absolute;
	top: 1em;
	right: 1em;
`;

const FilterContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 1em;
	height: 40px;
`;

const Search = styled.input`
	flex: 1;
	border-radius: 0.5em;
	border: none;
	border: 1px solid dodgerblue;
	padding: 0 0 0 1em;
	height: 100%;

	&:focus {
		outline: none;
	}
`;

const Filter = styled.select`
	border: 1px solid dodgerblue;
	border-radius: 0.5em;
	height: 100%;

	&:focus {
		outline: none;
	}
`;

const NoNotification = styled.div`
	text-align: center;
	font-size: 1.5em;
	margin-top: 2em;
`;
