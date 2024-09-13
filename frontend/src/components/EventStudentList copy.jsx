import React, { useState } from "react";
import styled from "styled-components";

const EventStudentList = ({events}) => {

	console.log(events);
	// const events = [
	// 	{
	// 		id: 1,
	// 		title: "Event 1",
	// 		description: "This is the description for event 1.",
	// 		pictures: [
	// 			"https://via.placeholder.com/150",
	// 			"https://via.placeholder.com/150",
	// 		],
	// 		endDateTime: "2024-07-08T12:00",
	// 		duration: "2 hours",
	// 	},
	// 	{
	// 		id: 2,
	// 		title: "Event 2",
	// 		description: "This is the description for event 2.",
	// 		pictures: [
	// 			"https://via.placeholder.com/150",
	// 			"https://via.placeholder.com/150",
	// 			"https://via.placeholder.com/150",
	// 		],
	// 		endDateTime: "2024-07-09T14:00",
	// 		duration: "3 hours",
	// 	},
	// 	{
	// 		id: 3,
	// 		title: "Event 3",
	// 		description: "This is the description for event 3.",
	// 		pictures: ["https://via.placeholder.com/150"],
	// 		endDateTime: "2024-07-10T10:00",
	// 		duration: "1.5 hours",
	// 	},
	// ];

	const [selectedImage, setSelectedImage] = useState(null);

	const handleImageClick = (src) => {
		setSelectedImage(src);
	};

	const closeModal = () => {
		setSelectedImage(null);
	};

	return (
		<>
			<Container>
				{events.map((event) => (
					<EventCard key={event.uid}>
						<EventTitle>{event.title}</EventTitle>
						<EventDescription>{event.description}</EventDescription>
						<EventImages>
							{event?.documents && event.documents.length > 0 && event.documents.map((doc, index) => (
								<EventImage
									key={index}
									src={doc}
									alt="Event"
									onClick={() => handleImageClick(doc)}
								/>
							))}
						</EventImages>
						<EventDetails>
							<EventDateTime>
								{new Date(event.endDateTime).toLocaleString()}
							</EventDateTime>
							<EventDuration>{event.duration} Hours</EventDuration>
						</EventDetails>
					</EventCard>
				))}
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
`;

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
	overflow-x: scroll;


	&::-webkit-scrollbar {
		display: none;
	}
`;

const EventImage = styled.img`
	max-width: 250px;
	min-width: 250px;
	height: auto;
	border-radius: 8px;
	cursor: pointer;
	border: 1px solid black;
	padding: 1em;
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
