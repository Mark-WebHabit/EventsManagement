import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ref, set } from "firebase/database";
import {
	ref as storageRef,
	uploadBytesResumable,
	getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../app/firebase.js";
import LoadingModal from "./LoadingModal.jsx";

const EditEventForm = ({
	event,
	onCancel,
	setSuccess,
	setErrorMessage,
	setIsErrorModalOpen,
}) => {
	const [editedEvent, setEditedEvent] = useState(event);
	const [loading, setLoading] = useState(false);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setEditedEvent({ ...editedEvent, [name]: value });
	};

	const handleFileChange = (e) => {
		const { name, files } = e.target;
		setEditedEvent({ ...editedEvent, [name]: files[0] });
	};

	const handleDocumentChange = (e) => {
		const files = Array.from(e.target.files);
		setEditedEvent({ ...editedEvent, documents: files });
	};

	const handleRemovePicture = () => {
		setEditedEvent({ ...editedEvent, picture: null });
	};

	const handleRemoveDocument = (index) => {
		const updatedDocuments = editedEvent.documents.filter(
			(_, i) => i !== index
		);
		setEditedEvent({ ...editedEvent, documents: updatedDocuments });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Example validation
		if (
			!editedEvent.title ||
			!editedEvent.description ||
			!editedEvent.startDateTime ||
			!editedEvent.endDateTime
		) {
			setIsErrorModalOpen(true);
			setErrorMessage("All fields are required.");
			return;
		}

		if (
			new Date(editedEvent.startDateTime) >= new Date(editedEvent.endDateTime)
		) {
			setIsErrorModalOpen(true);
			setErrorMessage("Start date-time must be before end date-time.");
			return;
		}

		if (!editedEvent.picture) {
			setIsErrorModalOpen(true);
			setErrorMessage("The template picture cannot be removed.");
			return;
		}

		setLoading(true);

		try {
			const eventRef = ref(db, `events/${editedEvent.uid}`);
			let updatedEvent = { ...editedEvent };

			if (editedEvent.picture && typeof editedEvent.picture === "object") {
				const eventStorageRef = storageRef(
					storage,
					`events/${editedEvent.picture.name}`
				);
				const uploadTask = uploadBytesResumable(
					eventStorageRef,
					editedEvent.picture
				);
				await uploadTask;
				const url = await getDownloadURL(eventStorageRef);
				updatedEvent.picture = url;
			}

			if (editedEvent.documents && editedEvent.documents.length > 0) {
				const documentUrls = [];
				for (const doc of editedEvent.documents) {
					if (typeof doc === "object") {
						const docStorageRef = storageRef(storage, `documents/${doc.name}`);
						const uploadTask = uploadBytesResumable(docStorageRef, doc);
						await uploadTask;
						const url = await getDownloadURL(docStorageRef);
						documentUrls.push(url);
					} else {
						documentUrls.push(doc);
					}
				}
				updatedEvent.documents = documentUrls;
			}

			// Calculate duration in hours
			const durationInMilliseconds =
				new Date(updatedEvent.endDateTime) -
				new Date(updatedEvent.startDateTime);
			const durationInHours = durationInMilliseconds / (1000 * 60 * 60);
			updatedEvent.duration = durationInHours;

			await set(eventRef, updatedEvent);
			setSuccess("Event updated successfully!");
		} catch (error) {
			console.log(error);
			setIsErrorModalOpen(true);
			setErrorMessage(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal>
			<ModalContent>
				<ModalHeader>
					<ModalTitle>Edit Event</ModalTitle>
					<CloseButton onClick={onCancel}>&times;</CloseButton>
				</ModalHeader>
				<ModalBody>
					<Form onSubmit={handleSubmit}>
						<Label>
							Title:
							<Input
								type="text"
								name="title"
								value={editedEvent.title}
								onChange={handleInputChange}
								disabled={event.status !== "Scheduled"}
							/>
						</Label>
						<Label>
							Description:
							<TextArea
								name="description"
								value={editedEvent.description}
								onChange={handleInputChange}
								maxLength="200"
							/>
							<CharCount>
								{200 - editedEvent.description.length} characters left
							</CharCount>
						</Label>
						<Label>
							Start DateTime:
							<Input
								type="datetime-local"
								name="startDateTime"
								value={editedEvent.startDateTime}
								onChange={handleInputChange}
								disabled={event.status !== "Scheduled"}
							/>
						</Label>
						<Label>
							End DateTime:
							<Input
								type="datetime-local"
								name="endDateTime"
								value={editedEvent.endDateTime}
								onChange={handleInputChange}
								disabled={event.status !== "Scheduled"}
							/>
						</Label>
						<Label>
							Upload Template Picture:
							<Input
								type="file"
								name="picture"
								onChange={handleFileChange}
								accept="image/*"
							/>
							{editedEvent.picture &&
								typeof editedEvent.picture === "string" && (
									<ImageContainer>
										<ImagePreview src={editedEvent.picture} alt="Event" />
										<RemoveButton onClick={handleRemovePicture}>
											&times;
										</RemoveButton>
									</ImageContainer>
								)}
						</Label>
						<Label>
							Upload Images:
							<Input
								type="file"
								name="documents"
								onChange={handleDocumentChange}
								accept="image/*"
								multiple
							/>
							{editedEvent.documents && editedEvent.documents.length > 0 && (
								<DocumentsContainer>
									{editedEvent.documents.map((doc, index) => (
										<DocumentItem key={index}>
											<a href={doc} target="_blank" rel="noopener noreferrer">
												Document {index + 1}
											</a>
											<RemoveButton onClick={() => handleRemoveDocument(index)}>
												&times;
											</RemoveButton>
										</DocumentItem>
									))}
								</DocumentsContainer>
							)}
						</Label>
						<ModalFooter>
							<CancelButton type="button" onClick={onCancel}>
								Cancel
							</CancelButton>
							<EditButton type="submit" disabled={loading}>
								{loading ? "Updating..." : "Save Changes"}
							</EditButton>
						</ModalFooter>
					</Form>
				</ModalBody>
			</ModalContent>
			{loading && <LoadingModal />}
		</Modal>
	);
};

export default EditEventForm;

const Modal = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
`;

const ModalContent = styled.div`
	background: white;
	padding: 1.5em;
	border-radius: 0.5em;
	width: 80%;
	max-width: 500px;
	max-height: 900px;
	overflow-y: scroll;

	position: relative;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1px solid #e5e5e5;
	padding-bottom: 0.5em;
	margin-bottom: 1em;
`;

const ModalTitle = styled.h2`
	margin: 0;
`;

const CloseButton = styled.span`
	font-size: 1.5rem;
	cursor: pointer;
`;

const ModalBody = styled.div`
	img {
		width: 100%;
		height: auto;
		margin-bottom: 1em;
	}

	p {
		margin: 0.5em 0;
	}
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: flex-end;
	padding-top: 1em;
	border-top: 1px solid #e5e5e5;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 1em;
`;

const Label = styled.label`
	display: flex;
	flex-direction: column;
	gap: 0.5em;
	font-weight: bold;
`;

const Input = styled.input`
	padding: 0.5em;
	border: 1px solid #ccc;
	border-radius: 0.3em;
`;

const TextArea = styled.textarea`
	height: 100px;
	padding: 0.5em;
	border: 1px solid #ccc;
	border-radius: 0.3em;
	resize: none;
	overflow-y: auto;
`;

const CharCount = styled.span`
	font-size: 0.8rem;
	color: grey;
	text-align: right;
`;

const EditButton = styled.button`
	font-size: 1rem;
	font-weight: bold;
	padding: 0.5em 1em;
	border-radius: 0.3em;
	border: none;
	cursor: pointer;
	background-color: dodgerblue;
	color: white;
	transition: all 200ms;

	&:hover {
		background-color: red;
	}
`;

const CancelButton = styled.button`
	font-size: 1rem;
	font-weight: bold;
	padding: 0.5em 1em;
	border-radius: 0.3em;
	border: none;
	cursor: pointer;
	background-color: #dc3545;
	color: white;
	transition: background-color 0.3s;
	margin-right: 1em;

	&:hover {
		background-color: #c82333;
	}
`;

const ImageContainer = styled.div`
	position: relative;
	width: 100%;
	max-width: 300px;
	margin-bottom: 1em;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 1em;
`;

const ImagePreview = styled.img`
	width: 100%;
	height: auto;
	border-radius: 0.3em;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
`;

const RemoveButton = styled.span`
	background: rgba(0, 0, 0, 0.7);
	color: white;
	padding: 0.2em 0.5em;
	cursor: pointer;
	font-size: 1.2rem;
	border-top-right-radius: 0.3em;
	border-bottom-left-radius: 0.3em;
`;

const DocumentsContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5em;
`;

const DocumentItem = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.5em;
	border: 1px solid #ccc;
	border-radius: 0.3em;
	background-color: #f9f9f9;
	box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);

	a {
		color: dodgerblue;
		text-decoration: none;
		word-wrap: break-word;

		&:hover {
			text-decoration: underline;
		}
	}
`;

const DocumentRemoveButton = styled(RemoveButton)`
	background: rgba(255, 0, 0, 0.7);
`;
