import React, { useState } from "react";
import styled from "styled-components";
import {
	BiCalendar,
	BiPlayCircle,
	BiCalendarEvent,
	BiCheckCircle,
	BiCertification
} from "react-icons/bi";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const EventStudentLeftBar = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();

	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	const handleClick = (path) => {
		setMenuOpen(false);
		navigate(`/student/${path}`);
	};

	return (
		<Container>
			<ToggleMenuButton onClick={toggleMenu}>
				{menuOpen ? <FaTimes /> : <FaBars />}
			</ToggleMenuButton>
			<Nav $menuOpen={menuOpen}>
				<NavItem onClick={() => handleClick("events")}>
					<BiCalendar className="icon" />
					<span>My Events</span>
				</NavItem>
				<NavItem onClick={() => handleClick("ongoing")}>
					<BiPlayCircle className="icon" />
					<span>Ongoing</span>
				</NavItem>
				<NavItem onClick={() => handleClick("upcoming")}>
					<BiCalendarEvent className="icon" />
					<span>Upcoming</span>
				</NavItem>
				<NavItem onClick={() => handleClick("accomplished")}>
					<BiCheckCircle className="icon" />
					<span>Accomplished</span>
				</NavItem>
				<NavItem onClick={() => handleClick("certificates")}>
					<BiCertification className="icon" />
					<span>Certificates</span>
				</NavItem>
			</Nav>
		</Container>
	);
};

export default EventStudentLeftBar;

const Container = styled.div`
	max-width: 250px;
	box-shadow: 0px 10px 5px 3px rgba(0, 0, 0, 0.3);
	padding: 5% 0;
	display: flex;
	flex-direction: column;
	gap: 1em;
	position: relative;
	min-height: 40px;

	@media (max-width: 768px) {
		max-width: 100%;
		box-shadow: 0px 3px 5px 0px rgba(0, 0, 0, 0.3);
		padding: 1em 0;
		flex-direction: row;
		justify-content: space-evenly;
	}

	@media (max-width: 500px) {
		flex-direction: column;
	}
`;

const ToggleMenuButton = styled.div`
	display: none;
	position: absolute;
	top: 10px;
	right: 10px;
	font-size: 1.5rem;
	cursor: pointer;

	@media (max-width: 500px) {
		display: block;
	}
`;

const Nav = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1em;

	@media (max-width: 768px) {
		flex-direction: row;
		justify-content: space-evenly;
		width: 100%;
	}

	@media (max-width: 500px) {
		flex-direction: column;
		max-height: ${(props) => (props.$menuOpen ? "500px" : "0")};
		overflow: hidden;
		transition: max-height 0.3s ease;
	}
`;

const NavItem = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5em;
	padding: 0.5em 1em;
	text-decoration: none;
	color: #333;
	transition: background 200ms;

	&:hover {
		background: #f0f0f0;
	}

	& .icon {
		font-size: 1.5rem;
	}

	@media (max-width: 768px) {
		padding: 0.5em;
		flex-direction: column;
		justify-content: center;

		& .icon {
			font-size: 1.2rem;
		}
	}

	@media (max-width: 500px) {
		flex-direction: row;
		width: 100%;
		justify-content: flex-start;
	}
`;
