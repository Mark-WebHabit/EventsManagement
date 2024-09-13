import React from 'react'

import styled from 'styled-components';

const NotificationCertificate = ({cert, index}) => {
  return (
		<Notification >
			<NotificationTitle>{cert.event.title}</NotificationTitle>
			<NotificationDescription>
				{cert.event.description}
			</NotificationDescription>
			<NotificationMessage>
				Thank you for attending {cert.event.title}.{" "}
				<a href={cert.cert} target="_blank" rel="noopener noreferrer">
					Click here to download certificate
				</a>
			</NotificationMessage>
			<NotificationDate>
				{new Date(cert.dateReceived).toLocaleString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
					hour: "numeric",
					minute: "numeric",
					hour12: true,
				})}
			</NotificationDate>
		</Notification>
	);
}

export default NotificationCertificate

const Notification = styled.div`
	background: #fff;
	border-radius: 8px;
	box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.5);
	padding: 1em;
	display: flex;
	flex-direction: column;
	gap: 0.5em;
	margin-bottom: 1em;
`;

const NotificationTitle = styled.h2`
	margin: 0;
`;

const NotificationDescription = styled.p`
	margin: 0;
`;

const NotificationMessage = styled.p`
	margin: 0;
`;

const NotificationDate = styled.span`
	font-size: 0.9em;
	color: #555;
`;