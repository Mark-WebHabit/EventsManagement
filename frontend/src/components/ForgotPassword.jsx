import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { ref, get } from "firebase/database";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { db, app } from "../app/firebase";

const ForgotPasswordModal = ({ onClose }) => {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState(null);
	const [isError, setIsError] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setEmail(e.target.value);
	};

	const handleResetPassword = useCallback(async () => {
		if (!email) {
			setMessage("Email is required.");
			setIsError(true);
			return;
		}

		setLoading(true);

		try {
			const userRef = ref(db, `users`);
			const snapshot = await get(userRef);
			let emailExists = false;

			snapshot.forEach((userSnapshot) => {
				const userData = userSnapshot.val();
				if (userData.email === email) {
					emailExists = true;
				}
			});

			if (!emailExists) {
				setMessage("Email not found in the database.");
				setIsError(true);
				setLoading(false);
				return;
			}

			const auth = getAuth(app);
			await sendPasswordResetEmail(auth, email);
			setMessage("Password reset link sent to your email.");
			setIsError(false);
		} catch (error) {
			setMessage("Error sending reset email. Please try again.");
			setIsError(true);
		} finally {
			setLoading(false);
		}
	}, [email]);

	return (
		<ModalOverlay>
			<ModalContent>
				<ModalHeader>
					<h2>Reset Password</h2>
				</ModalHeader>
				<ModalBody>
					<Input
						type="email"
						placeholder="Enter your email"
						value={email}
						onChange={handleChange}
					/>
					{message && <Message isError={isError}>{message}</Message>}
				</ModalBody>
				<ModalFooter>
					<Button onClick={handleResetPassword} disabled={loading}>
						{loading ? "Loading..." : "Reset Password"}
					</Button>
					<ButtonCancel onClick={onClose}>Cancel</ButtonCancel>
				</ModalFooter>
			</ModalContent>
		</ModalOverlay>
	);
};

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
`;

const ModalContent = styled.div`
	background: #fff;
	padding: 2rem;
	border-radius: 8px;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
	max-width: 400px;
	width: 100%;
`;

const ModalHeader = styled.div`
	margin-bottom: 1rem;
`;

const ModalBody = styled.div`
	margin-bottom: 1.5rem;
`;

const ModalFooter = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 1em;
`;

const Input = styled.input`
	width: 100%;
	padding: 0.5em;
	border: 1px solid #ddd;
	border-radius: 4px;
	margin-bottom: 1em;

	&:focus {
		outline: none;
		border-color: dodgerblue;
	}
`;

const Message = styled.p`
	color: ${({ isError }) => (isError ? "red" : "green")};
	margin-bottom: 1em;
`;

const Button = styled.button`
	padding: 0.5em 1em;
	border-radius: 0.5em;
	border: none;
	background-color: green;
	color: #fff;
	font-weight: 600;
	cursor: pointer;
`;

const ButtonCancel = styled(Button)`
	background-color: red;
`;

export default ForgotPasswordModal;
