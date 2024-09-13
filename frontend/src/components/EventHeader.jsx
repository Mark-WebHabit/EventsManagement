import React, { useState } from "react";
import styled from "styled-components";
import ConfirmationModal from "./ConfimationModal";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
// icons
import { FaPowerOff } from "react-icons/fa";
import {
	FaMagnifyingGlassChart,
	FaPeopleGroup,
	FaCertificate,
} from "react-icons/fa6";

import { courseOptions } from "../../courseOptions";
import { useNavigate, useParams } from "react-router-dom";
import LoadingModal from "./LoadingModal";

const EventHeader = ({
	eventData,
	searchText,
	handleSearchInputChange,
	handleCourseChange,
	selectedCourse,
	handleOpenConfirmationModal,
	showTable,
	setShowTable,
	evaluation,
	id,
}) => {
	const [message, setMessage] = useState("");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [successMessage, setSuccessMessage] = useState(null);
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const handleConfirmDistribute = async () => {
		setShowConfirmation(false)
		setLoading(true)
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}edit-pdf?event=${id}`
			);

			const data = await response.json()
			

			if(data.success){
				setSuccessMessage(data.message)
			}else{
				setError(data.message)
			}
		} catch (error) {
			console.log(error);
			setError(error.message);
		}finally{
			setLoading(false)
		}
	};

	if(loading){
		return <LoadingModal />
	}

	return (
		<>
			<Header>
				<Title>
					{eventData && eventData.title}
					<span> {eventData.status}</span>
				</Title>
				<Buttons className="buttons">
					{showTable && (
						<Filter>
							<Search
								placeholder="Search..."
								value={searchText}
								onChange={handleSearchInputChange}
							/>
						</Filter>
					)}

					{showTable && (
						<Filter>
							<span>Course</span>
							<Select onChange={handleCourseChange} value={selectedCourse}>
								<Option disabled>Select Filter</Option>
								<Option value={"ALL"}>All</Option>
								{courseOptions.map((course, index) => (
									<Option value={course.course} key={index}>
										{course.abbreviation}
									</Option>
								))}
							</Select>
						</Filter>
					)}
					<Button
						onClick={handleOpenConfirmationModal} // Open confirmation modal on button click
						// disabled={eventData.status !== "Ongoing" || !eventData.open}
					>
						<FaPowerOff />
						Attendance
					</Button>
					<Button onClick={() => navigate(`/admin/event/evaluation/${id}`)}>
						{evaluation ? "Form" : "+ Evaluation"}
					</Button>
					<Button onClick={() => setShowTable(!showTable)}>
						{showTable ? <FaMagnifyingGlassChart /> : <FaPeopleGroup />}
						{showTable ? "Reports" : "Presents"}
					</Button>
				</Buttons>
			</Header>
			<p>{message}</p>
			{eventData?.status?.toLowerCase() == "accomplished" && (
				<ButtonCert onClick={() => setShowConfirmation(true)}>
					{<FaCertificate />}
					Distribute Certificate
				</ButtonCert>
			)}
			{showConfirmation && (
				<ConfirmationModal
					message="Are you sure you want to distribute certificate?"
					onConfirm={handleConfirmDistribute}
					onCancel={() => setShowConfirmation(false)}
				/>
			)}
			{successMessage && (
				<SuccessModal
					message={successMessage}
					onClose={() => setSuccessMessage(null)}
				/>
			)}

			{error && <ErrorModal message={error} onClose={() => setError(null)} />}
		</>
	);
};

export default EventHeader;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 1em;
	gap: 1em;
	margin: 2em 0;
	margin-top: 1em;
`;

const Title = styled.p`
	font-size: 1.6rem;
	font-weight: 700;
	text-transform: capitalize;
	display: flex;
	align-items: center;
	gap: 1em;
	& span {
		font-weight: 400;
		font-size: 1rem;
		color: dodgerblue;
	}
`;

const Buttons = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	gap: 1em;
	justify-content: flex-end;
`;

const Filter = styled.div`
	display: flex;
	flex-direction: column;
	background: dodgerblue;
	padding: 0.2em;
	border-radius: 0.3em;

	& span {
		font-size: 0.7rem;
		margin-bottom: 0.1em;
		text-transform: uppercase;
		color: white;
	}
`;

const Search = styled.input`
	font-size: 1rem;
	padding: 0.5em;
	outline: none;
	background: transparent;
	color: white;
	border: none;
	width: 220px;

	&::placeholder {
		color: white;
		font-size: 0.9rem;
	}
`;

const Select = styled.select`
	font-size: 1rem;
	border: 1px solid white;
	background: none;
	outline: none;
	padding: 0.2em;
	border-radius: 0.3em;
	color: white;
`;

const Option = styled.option`
color: white;
padding: 0.3em; 0.5em;
background: dodgerblue;
`;

const Button = styled.button`
	padding: 0.8em;
	font-size: 1rem;
	font-weight: 500;
	color: white;
	background: dodgerblue;
	display: flex;
	align-items: center;
	gap: 0.4em;
	border: none;
	border-radius: 0.5em;

	&:hover {
		background: red;
		cursor: pointer;
	}
`;

const ButtonCert = styled(Button)`
	max-width: 250px;
	margin-bottom: 1em;
	margin-left: 1em;
`;
