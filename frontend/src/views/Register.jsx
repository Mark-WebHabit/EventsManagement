import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { PiIdentificationBadgeFill } from "react-icons/pi";
import InputGroup from "../components/InputGroup";
import FormButton from "../components/FormButton";
import ErrorModal from "../components/ErrorModal";

// courses
import { courseOptions } from "../../courseOptions";

// firebase
import { app, db } from "../app/firebase";
import {
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from "firebase/auth";
import { get, set, ref } from "firebase/database";

const Register = () => {
	const [formData, setFormData] = useState({
		username: "",
		studentId: "",
		email: "",
		password: "",
		course: "",
		major: "",
		section: "",
		year: "",
		fullName: "",
	});
	const [error, setError] = useState("");
	const [majorOpt, setMajorOpt] = useState([]);
	const [yearOpt, setYearOpt] = useState([]);
	const [sectionOpt, setSectionOpt] = useState([]);
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	// Set the options for Major and reset dependent fields
	useEffect(() => {
		if (formData.course === "") {
			setMajorOpt([]);
			setFormData((prevState) => ({
				...prevState,
				major: "",
				year: "",
				section: "",
			}));
			return;
		}

		const courses = courseOptions.find(
			(course) => course.course === formData.course
		)?.majors;

		const majors = courses ? courses.map((c) => c.major) : [];
		setMajorOpt(majors);

		// Reset dependent fields
		setFormData((prevState) => ({
			...prevState,
			major: "",
			year: "",
			section: "",
		}));
	}, [formData.course]);

	// Set the options for year and reset dependent fields
	useEffect(() => {
		if (formData.major === "") {
			setYearOpt([]);
			setFormData((prevState) => ({
				...prevState,
				year: "",
				section: "",
			}));
			return;
		}

		const selectedCourse = courseOptions.find(
			(course) => course.course === formData.course
		);

		const selectedMajor = selectedCourse?.majors.find(
			(major) => major.major === formData.major
		)?.yearLevels;

		const years = selectedMajor ? selectedMajor.map((c) => c.year) : [];
		setYearOpt(years);

		// Reset dependent fields
		setFormData((prevState) => ({
			...prevState,
			year: "",
			section: "",
		}));
	}, [formData.major]);

	// Set the options for section
	useEffect(() => {
		if (formData.year === "") {
			setSectionOpt([]);
			setFormData((prevState) => ({
				...prevState,
				section: "",
			}));
			return;
		}

		const selectedCourse = courseOptions.find(
			(course) => course.course === formData.course
		);

		const selectedMajor = selectedCourse?.majors.find(
			(major) => major.major === formData.major
		)?.yearLevels;

		const sections =
			selectedMajor?.find((c) => c.year === parseInt(formData.year))?.section ||
			[];

		setSectionOpt(sections);

		// Reset dependent fields
		setFormData((prevState) => ({
			...prevState,
			section: "",
		}));
	}, [formData.year]);

	const handleChange = (e) => {
		const { name, value } = e.target;

		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const {
			username,
			studentId,
			email,
			password,
			course,
			major,
			section,
			year,
			fullName,
		} = formData;

		if (
			!username ||
			!studentId ||
			!email ||
			!password ||
			!course ||
			!major ||
			!section ||
			!year ||
			!fullName
		) {
			setError("All Fields Required");
			return;
		}

		for (const [key, val] of Object.entries(formData)) {
			if (!val || val === "") {
				setError(`${key.charAt(0).toUpperCase() + key.slice(1)} is required`);
				return;
			}
		}

		// Check email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError("Invalid email format");
			return;
		}

		const auth = getAuth(app);
		setLoading(true);

		try {
			const isUserExists = await fetchSignInMethodsForEmail(auth, email);

			if (isUserExists.length > 0) {
				setError("This email is already registered. Please use another email");
				setLoading(false);
				return;
			}

			const userRef = ref(db, "users");
			const snapshot = await get(userRef);

			if (snapshot.exists()) {
				const users = snapshot.val();
				const existingUser = Object.values(users).find(
					(user) => user.studentId === studentId && user.email !== email
				);

				if (existingUser) {
					setError("Student ID already taken");
					setLoading(false);
					return;
				}
			}

			const userCred = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);

			const user = userCred.user;

			const newUserRef = ref(db, `users/${user.uid}`);

			await set(newUserRef, {
				username,
				email,
				studentId: studentId.toUpperCase(),
				major,
				course,
				section,
				role: "student",
				year: year,
				fullName,
			});

			await signOut(auth);

			await sendEmailVerification(user);
			alert("Registered Successfully! Email Verification sent");

			navigate("/login");
		} catch (err) {
			// Handle Firebase errors
			let errorMessage = "An error occurred. Please try again.";
			if (err.code === "auth/email-already-in-use") {
				errorMessage =
					"This email is already registered. Please use another email.";
			} else if (err.code === "auth/invalid-email") {
				errorMessage = "Invalid email format.";
			} else if (err.code === "auth/weak-password") {
				errorMessage = "Password should be at least 6 characters.";
			}
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const closeErrorModal = () => {
		setError("");
	};

	return (
		<RegisterContainer>
			<FormContainer>
				<Logo src="/logo.png" alt="School Logo" />
				<Title>Register</Title>
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
						type="text"
						placeholder="Lastname Given Name M.I"
						name="fullName"
						value={formData.fullName}
						onChange={handleChange}
						icon={FaUser}
						title={
							"Please make sure to follow the format, this will be put in your certificate"
						}
					/>
					<InputGroup
						type="text"
						placeholder="Student ID"
						name="studentId"
						value={formData.studentId}
						onChange={handleChange}
						icon={PiIdentificationBadgeFill}
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
						type="select"
						placeholder="Select Course"
						name="course"
						value={formData.course}
						onChange={handleChange}
						icon={FaUser}
						options={courseOptions.map((c) => {
							return c.course;
						})}
					/>
					<InputGroup
						type="select"
						placeholder="Major"
						name="major"
						value={formData.major}
						onChange={handleChange}
						icon={FaUser}
						disabled={formData.course == ""}
						options={majorOpt}
					/>
					<InputGroup
						type="select"
						placeholder="Year Level"
						name="year"
						value={formData.year}
						onChange={handleChange}
						icon={FaUser}
						disabled={formData.major == ""}
						options={yearOpt}
					/>
					<InputGroup
						type="select"
						placeholder="Section"
						name="section"
						value={formData.section}
						onChange={handleChange}
						icon={FaUser}
						disabled={formData.year == ""}
						options={sectionOpt}
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
					<FormButton type="submit" loading={loading}>
						{loading ? "Loading..." : "Register"}
					</FormButton>
				</Form>
				<LinksContainer>
					<StyledLink to="/register-admin">I'm an admin</StyledLink>
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

export default Register;
