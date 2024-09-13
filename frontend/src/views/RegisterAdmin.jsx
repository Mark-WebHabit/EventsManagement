import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaCode } from "react-icons/fa";
import InputGroup from "../components/InputGroup";
import FormButton from "../components/FormButton";
import { get, ref, set } from "firebase/database";
import { app, db } from "../app/firebase";
import {
	createUserWithEmailAndPassword,
	signOut,
	getAuth,
	fetchSignInMethodsForEmail,
	sendEmailVerification,
} from "firebase/auth";
import ErrorModal from "../components/ErrorModal";

const RegisterAdmin = () => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		systemCode: "",
	});
	const [error, setError] = useState(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const closeErrorModal = () => {
		setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			if (formData.systemCode != import.meta.env.VITE_SYSTEM_PIN) {
				setError("System Pin Incorrect");
				return;
			}

			const userRef = ref(db, "users");
			const userSnapshot = await get(userRef);

			// check for duplicate username and email
			if (userSnapshot.exists()) {
				const userData = userSnapshot.val();

				const users = Object.values(userData);

				const isUsernameTtaken = users.find(
					(user) => user.username == formData.username
				);

				if (isUsernameTtaken) {
					setError("Username taken");
					return;
				}

				const isEmailTaken = users.find((user) => user.email == formData.email);

				if (isEmailTaken) {
					setError("Email taken");
					return;
				}
			}

			const auth = getAuth(app);

			const userCred = await createUserWithEmailAndPassword(
				auth,
				formData.email,
				formData.password
			);

			const user = userCred.user;

			const newUserRef = ref(db, `users/${user.uid}`);

			await set(newUserRef, {
				username: formData.username,
				email: formData.email,
				role: "admin",
			});

			await signOut(auth);


       await sendEmailVerification(user);
				alert("Registered Successfully! Email Verification sent");


        setFormData({
					username: "",
					email: "",
					password: "",
					systemCode: "",
				});


		} catch (error) {
			console.log(error);
			setError(error.message);
		}
	};

	return (
		<RegisterContainer>
			<FormContainer>
				<Logo src="/logo.png" alt="School Logo" />
				<Title>Register Admin</Title>
				<Form onSubmit={handleSubmit}>
					<InputGroup
						type="text"
						placeholder="Username"
						name="username"
						value={formData.username}
						onChange={handleChange}
						icon={FaUser}
					/>
					<InputGroup
						type="email"
						placeholder="Email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						icon={FaEnvelope}
					/>
					<InputGroup
						type="number"
						placeholder="System Code"
						name="systemCode"
						value={formData.systemCode}
						onChange={handleChange}
						icon={FaCode}
					/>
					<InputGroup
						type="password"
						placeholder="Password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						icon={FaLock}
						pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
						title="Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character. Minimum length: 8 characters."
					/>
					<FormButton type="submit">Register</FormButton>
				</Form>
				<LinksContainer>
					<StyledLink to="/login">I have an account</StyledLink>
				</LinksContainer>
			</FormContainer>
			{error && <ErrorModal message={error} onClose={closeErrorModal} />}
		</RegisterContainer>
	);
};

const RegisterContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	background-color: #f4f4f4;
`;

const FormContainer = styled.div`
	background: #fff;
	padding: 2rem;
	border-radius: 8px;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
	max-width: 400px;
	width: 100%;
	text-align: center;

	@media (max-width: 600px) {
		padding: 1rem;
	}
`;

const Logo = styled.img`
	width: 100px;
	margin-bottom: 1rem;
`;

const Title = styled.h2`
	margin-bottom: 1.5rem;
	color: #333;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
`;

const LinksContainer = styled.div`
	margin-top: 1rem;
	display: flex;
	justify-content: space-between;
`;

const StyledLink = styled(Link)`
	color: #007bff;
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
`;

export default RegisterAdmin;
