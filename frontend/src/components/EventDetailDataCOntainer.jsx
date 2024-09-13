import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Chart from "chart.js/auto";
import { useSelector } from "react-redux";

import { courseOptions } from "../../courseOptions";

// charts
import {
	createChart1,
	createChart2,
	createChart3,
	generateChart,
} from "../utilities/chart.js";

const EventDetailDataContainer = ({
	data,
	showTable,
	responses,
	evaluation,
}) => {
	const { totalStudent } = useSelector((state) => state.user);
	// chart states
	const [chart1Labels, setChart1Labels] = useState([]);
	const [chart1Values, setChart1Values] = useState([]);
	const [chart2Values, setChart2Values] = useState([]);
	const [chart3Labels, setChart3Labels] = useState([]);
	const [chart3Values, setChart3Values] = useState([]);
	const [selectedCourseChart3, setSelectedCourseChart3] = useState(
		courseOptions[0].course
	);
	const [selectedCourseReport, setSelectedCourseReport] = useState(
		courseOptions[0].course
	);
	const [selectedMajorReport, setSelectedMajorReport] = useState("");
	const [selectedYearReport, setSelecteYearReport] = useState("");

	const [ratingQuestions, setRatingQuestions] = useState([]);
	const [commentQuestions, setCommentQuestions] = useState([]);
	const [selectedQuestion, setSelectedQuestion] = useState(null);
	const [expandedComments, setExpandedComments] = useState({});
	const [commentAnswers, setCommentAnswers] = useState(null);

	const chart1Ref = useRef();
	const chart2Ref = useRef();
	const chart3Ref = useRef();
	const reportRefs = useRef([]);

	useEffect(() => {
		if (!evaluation) {
			return;
		}
		if (evaluation?.rating) {
			setRatingQuestions(evaluation.rating);
		}

		if (evaluation?.comment && evaluation?.comment.length > 0) {
			setCommentQuestions(evaluation.comment);
		}
	}, [evaluation]);

	// Function to create the chart1
	useEffect(() => {
		const labels = courseOptions.map((c) => ({
			abbreviation: c.abbreviation,
			course: c.course,
		}));

		const values = labels.map((label) => {
			const count = data.reduce((total, student) => {
				return student.course === label.course ? total + 1 : total;
			}, 0);
			return count;
		});
		setChart1Labels(labels);
		setChart1Values(values);
	}, [data, courseOptions]);

	// set the chart2 values
	useEffect(() => {
		const present = data.length;
		const absent = totalStudent - present;

		const arr = [present, absent];
		setChart2Values(arr);
	}, [data, totalStudent]);

	useEffect(() => {
		if (!selectedCourseChart3) {
			return;
		}

		const selectedCourse = courseOptions.find(
			(c) => c.course === selectedCourseChart3
		);

		if (selectedCourse) {
			const arr = [];
			const majors = selectedCourse.majors.map((major) => major);

			majors.forEach((m) => {
				arr.push(m.major);
			});

			setChart3Labels(arr);

			const values = arr.map((label) => {
				const count = data.reduce((total, student) => {
					return student.major === label ? total + 1 : total;
				}, 0);

				return count;
			});

			setChart3Values(values);
		}
	}, [selectedCourseChart3, courseOptions]);

	useEffect(() => {
		createChart1(chart1Ref, data, chart1Labels, chart1Values);

		createChart2(chart2Ref, data, chart2Values);
	}, [chart1Labels, chart1Values, showTable, chart2Values]);

	useEffect(() => {
		createChart3(chart3Ref, chart3Labels, chart3Values);
	}, [selectedCourseChart3, chart3Labels]);

	useEffect(() => {
		if (!ratingQuestions) {
			return;
		}

		if (!evaluation?.rating) {
			return;
		}

		ratingQuestions.forEach((rate) => {
			const counts = rate.answers.map((answer) => {
				return responses.reduce((total, student) => {
					if (
						student?.course.toLowerCase() ===
							selectedCourseReport.toLowerCase() &&
						student?.rating.some((r) => {
							if (!selectedMajorReport && !selectedYearReport) {
								return (
									student.course.trim().toLowerCase() ==
										selectedCourseReport.trim().toLowerCase() &&
									rate.questionId == r.questionId &&
									answer.trim().toLowerCase() == r.value.trim().toLowerCase()
								);
							} else if (
								selectedCourseReport &&
								selectedMajorReport &&
								!selectedYearReport
							) {
								return (
									student.course.trim().toLowerCase() ==
										selectedCourseReport.trim().toLowerCase() &&
									student.major.trim().toLowerCase() ==
										selectedMajorReport.trim().toLocaleLowerCase() &&
									rate.questionId == r.questionId &&
									answer.trim().toLowerCase() == r.value.trim().toLowerCase()
								);
							} else if (
								selectedCourseReport &&
								selectedMajorReport &&
								selectedYearReport
							) {
								return (
									student.course.trim().toLowerCase() ==
										selectedCourseReport.trim().toLowerCase() &&
									student.major.trim().toLowerCase() ==
										selectedMajorReport.trim().toLocaleLowerCase() &&
									student.year == selectedYearReport &&
									rate.questionId == r.questionId &&
									answer.trim().toLowerCase() == r.value.trim().toLowerCase()
								);
							}
						})
					) {
						return total + 1;
					}
					return total;
				}, 0);
			});

			generateChart(
				reportRefs.current[rate.questionId],
				rate.answers,
				counts,
				rate.question
			);
		});

		const answerArr = [];
		responses.forEach((resp) => {
			if(resp.course == selectedCourseReport){
				console.log(selectedCourseReport);
				console.log(resp.course);
			}
			if (!selectedMajorReport && !selectedYearReport) {
				if (
					resp?.comment &&
					resp.comment.length > 0 &&
					resp.course == selectedCourseReport
				) {
					console.log("hello");
					resp.comment.forEach((com) => {
						if (com.questionId == selectedQuestion) {
							const username = resp.username;
							const answer = com.value;

							let obj = {
								username,
								comment: answer,
							};

							answerArr.push(obj);
						}
					});
				}
			} else if (
				selectedCourseReport &&
				selectedMajorReport &&
				!selectedYearReport
			) {
				console.log("hello");

				if (
					resp?.comment &&
					resp.comment.length > 0 &&
					resp.course == selectedCourseReport &&
					resp.major == selectedMajorReport
				) {
					resp.comment.forEach((com) => {
						if (com.questionId == selectedQuestion) {
							const username = resp.username;
							const answer = com.value;

							let obj = {
								username,
								comment: answer,
							};

							answerArr.push(obj);
						}
					});
				}
			} else if (
				selectedCourseReport &&
				selectedMajorReport &&
				selectedYearReport
			) {
				console.log("hello");

				if (
					resp?.comment &&
					resp.comment.length > 0 &&
					resp.course == selectedCourseReport &&
					resp.major == selectedMajorReport &&
					resp.year == selectedYearReport
				) {
					resp.comment.forEach((com) => {
						if (com.questionId == selectedQuestion) {
							const username = resp.username;
							const answer = com.value;

							let obj = {
								username,
								comment: answer,
							};

							answerArr.push(obj);
						}
					});
				}
			}
		});
		console.log(answerArr);
		setCommentAnswers(answerArr);
	}, [
		selectedCourseReport,
		selectedMajorReport,
		selectedYearReport,
		evaluation,
		ratingQuestions,
		commentQuestions,
		responses,
		selectedQuestion,
	]);

	const hanldeSelectCourse = (e) => {
		setSelectedMajorReport("");
		setSelecteYearReport("");
		setSelectedCourseReport(e.target.value);
	};

	const handleSelectMajor = (e) => {
		setSelecteYearReport("");
		setSelectedMajorReport(e.target.value);
	};

	if (!data || data?.length < 1) {
		return <NoStudent>No Student completed the attendance yet</NoStudent>;
	}

	const handleCommentClick = (index) => {
		setExpandedComments((prev) => ({
			...prev,
			[index]: !prev[index],
		}));
	};

	return (
		<DataContainer>
			{data && data?.length > 0 && (
				<ChartWrapper>
					<ChartContainer>
						<canvas ref={chart1Ref}></canvas>
					</ChartContainer>
				</ChartWrapper>
			)}
			{data && data?.length > 0 && (
				<ChartWrapper>
					<ChartContainer className="pie">
						<canvas ref={chart2Ref}></canvas>
					</ChartContainer>
				</ChartWrapper>
			)}
			{data && data?.length > 0 && courseOptions && (
				<ChartWrapper>
					<FilterCourseChart3
						value={selectedCourseChart3}
						onChange={(e) => setSelectedQuestion(e.target.value)}
					>
						{courseOptions.map((c, index) => (
							<option key={index} value={c.course}>
								{c.abbreviation}
							</option>
						))}
					</FilterCourseChart3>
					<ChartContainer>
						<canvas ref={chart3Ref}></canvas>
					</ChartContainer>
				</ChartWrapper>
			)}

			{/* charts for responses */}

			<FilterReport>
				<p>Filter Report</p>
				<Select value={selectedCourseReport} onChange={hanldeSelectCourse}>
					{courseOptions.map((c, index) => (
						<option value={c.course} key={index}>
							{c.abbreviation}
						</option>
					))}
				</Select>
				<Select value={selectedMajorReport} onChange={handleSelectMajor}>
					<option value="" disabled>
						Select Major
					</option>
					{courseOptions
						.find((c) => c.course === selectedCourseReport)
						?.majors.map((m, index) => (
							<option value={m.major} key={index}>
								{m.major}
							</option>
						))}
				</Select>
				<Select
					value={selectedYearReport}
					onChange={(e) => setSelecteYearReport(e.target.value)}
				>
					<option value="" disabled>
						Select Year
					</option>
					{courseOptions
						.find((c) => c.course === selectedCourseReport)
						?.majors.find((m) => m.major === selectedMajorReport)
						?.yearLevels.map((y, index) => (
							<option value={y.year} key={index}>
								{y.year}
							</option>
						))}
				</Select>
			</FilterReport>

			{ratingQuestions &&
				ratingQuestions?.length > 0 &&
				ratingQuestions.map((val) => (
					<ChartWrapperReport key={val.questionId}>
						<ChartContainer>
							<canvas
								ref={(el) => (reportRefs.current[val.questionId] = el)}
							></canvas>
						</ChartContainer>
					</ChartWrapperReport>
				))}

			{commentQuestions && commentQuestions?.length > 0 && (
				<CommentContainer>
					<SelectComment onChange={(e) => setSelectedQuestion(e.target.value)}>
						{!selectedQuestion && (
							<option value="">Select A Comment To Display</option>
						)}
						{commentQuestions.map((c) => (
							<option value={c.questionId} key={c.questionId}>
								{c.question}
							</option>
						))}
					</SelectComment>
					{selectedQuestion && (
						<Table>
							<thead>
								<TableRow>
									<TableHeader>Username</TableHeader>
									<TableHeader>Comment</TableHeader>
								</TableRow>
							</thead>
							<tbody>
								{commentAnswers.map((comment, index) => (
									<TableRow key={index}>
										<TableData>{comment.username}</TableData>
										<TableData colSpan="2">
											<Comment onClick={() => handleCommentClick(index)}>
												{expandedComments[index]
													? comment.comment
													: `${comment.comment.slice(0, 50)}...`}
											</Comment>
										</TableData>
									</TableRow>
								))}
							</tbody>
						</Table>
					)}
				</CommentContainer>
			)}
		</DataContainer>
	);
};

export default EventDetailDataContainer;

const DataContainer = styled.div`
	width: 100vw;
	overflow-x: scroll;
	flex: 1;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: flex-start;
	gap: 3%;
	padding: 1em;
	padding-top: 0;
	align-content: flex-start;
`;

const ChartWrapper = styled.div`
	width: 23%;
	height: fit-content;
	box-shadow: 0px 0px 10px 0px dodgerblue;
	border-radius: 1em;
	position: relative;
	margin-bottom: 0; /* Add some margin at the bottom to space out multiple charts */
	transition: all 200ms;
	&:hover {
		scale: 0.99;
	}
	overflow: hidden;
`;

const ChartWrapperReport = styled(ChartWrapper)`
	width: 27%;
	margin-bottom: 1.5em;
`;

const ChartContainer = styled.div`
	position: relative;
	width: 100%;
	padding-top: 100%; /* This creates a square container based on width */
	height: 0;
	&.pie {
		padding-top: 100%; /* Same value to ensure consistency */
	}
	canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100% !important;
		height: 100% !important;
		padding: 1em;
	}
`;

const FilterCourseChart3 = styled.select`
	padding: 0.3em 1em;
	border: none;
	background: dodgerblue;
	outline: none;
	color: white;
	display: inline-block;
	margin: 0 auto;
`;

const FilterReport = styled.div`
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-start;
	margin-bottom: 0.5em;

	& p {
		width: 100%;
		font-size: 1.4rem;
		text-transform: uppercase;
	}
`;

const Select = styled.select`
	margin-right: 1em;
	font-size: 1.2rem;
	max-width: 400px;
	color: white;
	background: dodgerblue;
	border: none;
	outline: none;
	padding: 0.2em 0.5em;

	&:focus {
	}
`;

const FilterWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-evenly;
	padding-top: 0.5em;
`;

const NoStudent = styled.p`
	font-size: 2rem;
	text-align: center;
	margin-top: 4%;
`;

const CommentContainer = styled.div`
	margin: 2em auto;
	width: 97vw;
	border: 2px solid dodgerblue;
	border-radius: 0.5em;
	padding: 1em;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	margin-top: 1em;
`;

const TableRow = styled.tr`
	&:nth-child(even) {
		background-color: #f2f2f2;
	}
`;

const TableHeader = styled.th`
	padding: 12px 8px;
	text-align: left;
	border-bottom: 2px solid #ddd;
	background-color: #007bff;
	color: #fff;
	font-size: 1.1em;
`;

const TableData = styled.td`
	padding: 12px 8px;
	border-bottom: 1px solid #ddd;
	text-align: left;
	vertical-align: top;
	word-wrap: break-word;
	max-width: 600px; /* Adjust as needed */
`;

const Comment = styled.span`
	cursor: pointer;
	color: black;
	font-size: 1.2rem;
	text-decoration: underline;

	&:hover {
		color: darkblue;
	}
`;

const SelectComment = styled.select`
	width: 80%;
	display: block;
	padding: 0.5em 1em;
	margin: 0.5em auto 1em;
	border: 2px solid dodgerblue;
	border-radius: 0.5em;
	font-size: 1.2em;
	background-color: #f0f4f8;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: border-color 0.3s, box-shadow 0.3s;

	&:focus {
		outline: none;
		border-color: darkblue;
		box-shadow: 0 0 8px rgba(0, 123, 255, 0.5);
	}
`;
