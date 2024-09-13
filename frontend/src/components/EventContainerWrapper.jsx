import React from 'react'
import styled from 'styled-components';

const EventContainerWrapper = ({event, handleImageClick, handleEventClick}) => {
  return (
		<EventCard  onClick={() => handleEventClick(event.uid)}>
			<EventTitle>{event.title}</EventTitle>
			<EventDescription>{event.description}</EventDescription>
			<EventImages>
				{event?.documents &&
					event.documents.length > 0 &&
					event.documents.map((doc, index) => (
						<EventImage
							key={index}
							src={doc}
							alt="Event"
							onClick={(e) => {
								e.stopPropagation();
								handleImageClick(doc);
							}}
						/>
					))}
			</EventImages>
			<EventDetails>
				<EventDateTime>
					{new Date(event.endDateTime).toLocaleString()}
				</EventDateTime>
				<EventDuration>
					{parseFloat(event.duration).toFixed(2)} Hours
				</EventDuration>
			</EventDetails>
		</EventCard>
	);
}

export default EventContainerWrapper


const EventCard = styled.div`
	background: #fff;
	border-radius: 8px;
	box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.5);
	padding: 1em;
	display: flex;
	flex-direction: column;
	gap: 0.5em;
`;

const EventTitle = styled.h2`
	margin: 0;
`;

const EventDescription = styled.p`
	margin: 0;
`;

const EventImages = styled.div`
	display: flex;
	gap: 0.5em;
	overflow-x: auto;
	max-width: 100%;

	&::-webkit-scrollbar {
		display: none;
	}
`;

const EventImage = styled.img`
	max-width: 150px;
	border-radius: 8px;
	cursor: pointer;
	border: 1px solid black;
	padding: 0.3em;

	@media (max-width: 468px) {
		max-width: 100px;
	}
`;

const EventDetails = styled.div`
	display: flex;
	justify-content: space-between;
`;

const EventDateTime = styled.span`
	font-size: 0.9em;
	color: #555;
`;

const EventDuration = styled.span`
	font-size: 0.9em;
	color: #555;
`;