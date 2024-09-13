import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import InputGroup from "../components/InputGroup";
import FormButton from "../components/FormButton";
import ErrorModal from "../components/ErrorModal.jsx";
import ForgotPasswordModal from "../components/ForgotPassword.jsx";

import { app, db } from "../app/firebase.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);
	const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
	const navigate = useNavigate();

	const auth = getAuth(app);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault();
			const { email, password } = formData;

			if (!email || !password) {
				setError("All fields required.");
				return;
			}

			setLoading(true);

			try {
				const userCred = await signInWithEmailAndPassword(
					auth,
					email,
					password
				);
				const user = userCred?.user;

				if (!user.emailVerified) {
					setIsSigningOut(true);
					await signOut(auth);
					setIsSigningOut(false);
					setError("Please verify your email to login.");
					setLoading(false);
					return;
				}

				const userRef = ref(db, `users/${user.uid}`);
				const snapshot = await get(userRef);

				if (!snapshot.exists()) {
					setIsSigningOut(true);
					await signOut(auth);
					setIsSigningOut(false);
					setError("Forbidden User");
					setLoading(false);
					return;
				}

				const role = snapshot.val();

				if (role.role === "admin") {
					navigate("/admin");
				} else if (role.role === "student") {
					navigate("/student");
				}
			} catch (error) {
				let errorMessage = "";
				if (
					error.code === "auth/user-not-found" ||
					error.code === "auth/wrong-password"
				) {
					errorMessage = "Invalid Email or Password";
				} else if (error.code === "auth/invalid-email") {
					errorMessage = "Invalid email format.";
				} else if (error.code === "auth/invalid-credential") {
					errorMessage = "Wrong email or password";
				}
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[formData, auth, navigate]
	);

	const closeErrorModal = useCallback((cb = null) => {
		setError(null);

		if (cb) {
			cb();
		}
	}, []);

	const toggleForgotPasswordModal = () => {
		setShowForgotPasswordModal(!showForgotPasswordModal);
	};

	return (
		<LoginContainer>
			<FormContainer>
				<Logo src="/logo.png" alt="School Logo" />
				<Title>Login</Title>
				<Form onSubmit={handleSubmit}>
					<InputGroup
						type="text"
						placeholder="Email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						icon={FaUser}
					/>
					<InputGroup
						type="password"
						placeholder="Password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						icon={FaLock}
					/>
					<FormButton type="submit" loading={loading}>
						{loading ? "Loading..." : "Login"}
					</FormButton>
				</Form>
				<LinksContainer>
					<StyledLink to="/register">Create account</StyledLink>
				</LinksContainer>
				<Button onClick={toggleForgotPasswordModal}>Forgot Password</Button>
			</FormContainer>
			{error && <ErrorModal message={error} onClose={closeErrorModal} />}
			{showForgotPasswordModal && (
				<ForgotPasswordModal onClose={toggleForgotPasswordModal} />
			)}
		</LoginContainer>
	);
};

const LoginContainer = styled.div`
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
	justify-content: center;
`;

const StyledLink = styled(Link)`
	color: #007bff;
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
`;

const Button = styled.button`
	border: none;
	margin-top: 1em;
`;

export default Login;
