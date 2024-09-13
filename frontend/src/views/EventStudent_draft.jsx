import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { BiShow, BiHide } from "react-icons/bi";

const EventStudent = () => {
	const [eventsData, setEventsData] = useState([]);
	const [onGoingEvents, setOngoingEvents] = useState([]);
	const [scheduledEvents, setScheduledEvents] = useState([]);
	const [accomplishedEvents, setAccomplishedEvents] = useState([]);
	const [showOngoing, setShowOngoing] = useState(true);
	const [showScheduled, setShowScheduled] = useState(true);
	const [showAccomplished, setShowAccomplished] = useState(true);

	const { events } = useSelector((state) => state.events);

	useEffect(() => {
		setEventsData(events);
	}, [events]);

	useEffect(() => {
		if (!eventsData || eventsData.length < 1) {
			return;
		}

		const ongoing = eventsData.filter((event) => event.status === "Ongoing");
		const scheduled = eventsData.filter(
			(event) => event.status === "Scheduled"
		);
		const accomplished = eventsData.filter(
			(event) => event.status === "Accomplished"
		);

		setOngoingEvents(ongoing);
		setScheduledEvents(scheduled);
		setAccomplishedEvents(accomplished);
	}, [eventsData]);

	return (
		<Container>
			<Section>
				<Title onClick={() => setShowOngoing(!showOngoing)}>
					{showOngoing ? "Hide Ongoing Events" : "Show Ongoing Events"}
					{showOngoing ? (
						<BiHide className="icon" />
					) : (
						<BiShow className="icon" />
					)}
				</Title>
				{showOngoing && (
					<EventList>
						{onGoingEvents.length > 0 ? (
							onGoingEvents.map((event) => (
								<EventCard key={event.id}>
									<EventImage src={event.image} alt={event.description} />
									<EventDetails>
										<h3>{event.description}</h3>
										<p>Duration: {event.duration}</p>
										<p>Start: {event.startDateTime}</p>
										<p>End: {event.endDateTime}</p>
									</EventDetails>
								</EventCard>
							))
						) : (
							<p>No Ongoing Events</p>
						)}
					</EventList>
				)}
			</Section>

			<Section>
				<Title onClick={() => setShowScheduled(!showScheduled)}>
					{showScheduled ? "Hide Scheduled Events" : "Show Scheduled Events"}
					{showScheduled ? (
						<BiHide className="icon" />
					) : (
						<BiShow className="icon" />
					)}
				</Title>
				{showScheduled && (
					<EventList>
						{scheduledEvents.length > 0 ? (
							scheduledEvents.map((event) => (
								<EventCard key={event.id}>
									<EventImage src={event.image} alt={event.description} />
									<EventDetails>
										<h3>{event.description}</h3>
										<p>Duration: {event.duration}</p>
										<p>Start: {event.startDateTime}</p>
										<p>End: {event.endDateTime}</p>
									</EventDetails>
								</EventCard>
							))
						) : (
							<p>No Scheduled Events</p>
						)}
					</EventList>
				)}
			</Section>

			<Section>
				<Title onClick={() => setShowAccomplished(!showAccomplished)}>
					{showAccomplished
						? "Hide Accomplished Events"
						: "Show Accomplished Events"}
					{showAccomplished ? (
						<BiHide className="icon" />
					) : (
						<BiShow className="icon" />
					)}
				</Title>
				{showAccomplished && (
					<EventList>
						{accomplishedEvents.length > 0 ? (
							accomplishedEvents.map((event) => (
								<EventCard key={event.id}>
									<EventImage src={event.image} alt={event.description} />
									<EventDetails>
										<h3>{event.description}</h3>
										<p>Duration: {event.duration}</p>
										<p>Start: {event.startDateTime}</p>
										<p>End: {event.endDateTime}</p>
									</EventDetails>
								</EventCard>
							))
						) : (
							<p>No Accomplished Events</p>
						)}
					</EventList>
				)}
			</Section>
		</Container>
	);
};

export default EventStudent;

const Container = styled.div`
	padding: 1em;
`;

const Section = styled.div`
	margin-bottom: 2em;
`;

const Title = styled.p`
	font-size: 1.5rem;
	display: flex;
	align-items: center;
	gap: 0.5em;
	cursor: pointer;
	user-select: none;

	& .icon {
		font-size: 1.5rem;
		transition: color 200ms;

		&:hover {
			color: red;
		}
	}
`;

const EventList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1em;
`;

const EventCard = styled.div`
	display: flex;
	flex-direction: column;
	border: 1px solid #ddd;
	border-radius: 8px;
	overflow: hidden;
	background: #fff;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	transition: transform 200ms;

	&:hover {
		transform: translateY(-5px);
	}
`;

const EventImage = styled.img`
	width: 100%;
	height: 200px;
	object-fit: cover;
`;

const EventDetails = styled.div`
	padding: 1em;

	h3 {
		margin: 0 0 0.5em;
		font-size: 1.2rem;
	}

	p {
		margin: 0.2em 0;
		color: #666;
	}
`;

// Add responsiveness
const mediaQueries = {
	mobile: "@media(max-width: 768px)",
	tablet: "@media(max-width: 1024px)",
};

Container = styled(Container)`
	${mediaQueries.mobile} {
		padding: 0.5em;
	}
`;

EventCard = styled(EventCard)`
	${mediaQueries.mobile} {
		flex-direction: column;
	}
`;

EventImage = styled(EventImage)`
	${mediaQueries.mobile} {
		height: 150px;
	}
`;
