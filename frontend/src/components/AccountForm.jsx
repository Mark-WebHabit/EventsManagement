import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { courseOptions } from "../../courseOptions";
import { useSelector } from "react-redux";
import { onValue, ref, update } from "firebase/database";
import { db } from "../app/firebase";
import ErrorModal from "./ErrorModal";
import SuccessModal from "./SuccessModal";

const AccountForm = () => {
	const [formData, setFormData] = useState({
		username: "",
		studentId: "",
		email: "",
		course: "",
		major: "",
		section: "",
		year: "",
		fullName: "",
	});
	const [majorOpt, setMajorOpt] = useState([]);
	const [yearOpt, setYearOpt] = useState([]);
	const [sectionOpt, setSectionOpt] = useState([]);
    	const [error, setError] = useState(null);
        const [success, setSuccess] = useState(null) 

	const { user } = useSelector((state) => state.user);

	useEffect(() => {
		if (!user) {
			return;
		}

		const userRef = ref(db, `users/${user.uid}`);
		const unsubscribe = onValue(userRef, (snapshot) => {
			const data = snapshot.val();
			setFormData({
				username: data.username,
				studentId: data.studentId,
				email: data.email,
				course: data.course,
				major: data.major,
				year: data.year,
				section: data.section,
				fullName: data.fullName,
			});
		});

		return () => {
			unsubscribe();
		};
	}, [user]);

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

		setFormData((prevState) => ({
			...prevState,
			major: "",
			year: "",
			section: "",
		}));
	}, [formData.course]);

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

		setFormData((prevState) => ({
			...prevState,
			year: "",
			section: "",
		}));
	}, [formData.major]);

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

    const handleSubmit = (e) => {
        setError(null)
        setSuccess(null)
			e.preventDefault();
			// Validate form data
			const requiredFields = [
				"username",
				"studentId",
				"email",
				"course",
				"major",
				"section",
				"year",
				"fullName",
			];
			for (const field of requiredFields) {
				if (!formData[field]) {
					setError(`Please fill in the ${field}`);
					return;
				}
			}
			setError("");

			// Update user data in Firebase
			const userRef = ref(db, `users/${user.uid}`);
			update(userRef, formData)
				.then(() => {
                    setSuccess("Account Updated")
					console.log("Data updated successfully!");
				})
				.catch((error) => {
                    setError(error.message)
					console.error("Error updating data: ", error);
				});
		};

	return (
		<Container onSubmit={handleSubmit}>
			<FormField>
				<Label>Username</Label>
				<Input
					type="text"
					placeholder="Enter your username"
					name="username"
					value={formData.username}
					onChange={handleChange}
				/>
			</FormField>
			<FormField>
				<Label>Full Name</Label>
				<Input
					type="text"
					placeholder="Enter your full name"
					name="fullName"
					value={formData.fullName}
					onChange={handleChange}
				/>
			</FormField>
			<FormField>
				<Label>Student ID</Label>
				<Input
					type="text"
					placeholder="Enter your student ID"
					name="studentId"
					value={formData.studentId}
					onChange={handleChange}
				/>
			</FormField>
			<FormField>
				<Label>Course</Label>
				<Select name="course" value={formData.course} onChange={handleChange}>
					<option value="">Select Course</option>
					{courseOptions.map((c, index) => (
						<option value={c.course} key={index}>
							{c.abbreviation}
						</option>
					))}
				</Select>
			</FormField>
			<FormField>
				<Label>Major</Label>
				<Select
					name="major"
					value={formData.major}
					disabled={formData.course === ""}
					onChange={handleChange}
				>
					<option value="">Select Major</option>
					{majorOpt.map((c, index) => (
						<option value={c} key={index}>
							{c}
						</option>
					))}
				</Select>
			</FormField>
			<FormField>
				<Label>Year</Label>
				<Select
					name="year"
					value={formData.year}
					onChange={handleChange}
					disabled={formData.major === ""}
				>
					<option value="">Select Year</option>
					{yearOpt.map((y, index) => (
						<option value={y} key={index}>
							{y}
						</option>
					))}
				</Select>
			</FormField>
			<FormField>
				<Label>Section</Label>
				<Select
					name="section"
					value={formData.section}
					onChange={handleChange}
					disabled={formData.year === ""}
				>
					<option value="">Select Section</option>
					{sectionOpt.map((s, index) => (
						<option value={s} key={index}>
							{s}
						</option>
					))}
				</Select>
			</FormField>
			<Buttons>
				<Button type="submit">Submit</Button>
				<ButtonCancel type="button">Cancel</ButtonCancel>
			</Buttons>

            {
                error && <ErrorModal message={error} onClose={() => setError(null)} />
            }
            {
                success && <SuccessModal message={success} onClose={() => setSuccess(null)} />
            }
		</Container>
	);
};

export default AccountForm;

const Container = styled.form`
	display: flex;
	flex-direction: column;
	gap: 1em;
	padding: 1em;
	background: #fff;
	border-radius: 8px;
	box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.5);

	@media (max-width: 768px) {
		width: 95vw;
	}
`;

const FormField = styled.div`
	display: flex;
	flex-direction: column;
`;

const Label = styled.label`
	margin-bottom: 0.5em;
	font-weight: bold;
`;

const Input = styled.input`
	padding: 0.5em;
	border: 1px solid #ddd;
	border-radius: 4px;

	&:focus {
		outline: none;
		border-color: dodgerblue;
	}
`;

const Select = styled.select`
	padding: 0.5em;
	border: 1px solid #ddd;
	border-radius: 4px;

	&:focus {
		outline: none;
		border-color: dodgerblue;
	}
`;

const Buttons = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1em;
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
