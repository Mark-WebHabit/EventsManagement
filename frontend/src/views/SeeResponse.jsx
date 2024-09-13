import {
	equalTo,
	get,
	orderByChild,
	push,
	query,
	ref,
} from "firebase/database";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { db } from "../app/firebase";
import ErrorModal from "../components/ErrorModal";
import SuccessModal from "../components/SuccessModal";
import { useSelector } from "react-redux";

const SeeResponse = () => {
	const [evaluation, setEvaluation] = useState(null);
	const [responses, setResponses] = useState({
		rating: [],
		comment: [],
	});
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const { uid, userId } = useParams();
	const { user } = useSelector((state) => state.user);
	const navigate = useNavigate();

	useEffect(() => {
		if (!uid || !userId) {
			navigate("/404");
			return;
		}

		if (!user || user.uid !== userId) {
			setErrorMessage("You are not allowed here!");
			navigate(-1);
			return;
		}

		async function fetchEval() {
			const evalRef = ref(db, `evaluation/${uid}`);

			const evaluationSnapshot = await get(evalRef);

			if (!evaluationSnapshot.exists()) {
				navigate("/404");
				return;
			}

			const evaluationData = evaluationSnapshot.val();
			setEvaluation(evaluationData);
		}

		async function fetchResponse() {
			try {
				const responseRef = ref(db, "responses");

				const responseQuery = query(
					responseRef,
					orderByChild("evaluationId"),
					equalTo(uid)
				);

				const responsesSnap = await get(responseQuery);

				if (responsesSnap.exists()) {
					let data = responsesSnap.val();
					data = Object.values(data);

					const currentUserResponse = data.find(
						(resp) => resp.userId === userId
					);

					if (currentUserResponse) {
						setResponses({
							rating: currentUserResponse.rating || [],
							comment: currentUserResponse.comment || [],
						});
					}
				}
			} catch (error) {
				console.log(error);
				setErrorMessage(error.message);
			}
		}

		fetchEval();
		fetchResponse();
	}, [uid, userId, user, navigate]);


	return (
		<Container>
			<Wrapper>
				{evaluation ? (
					<>
						<Instruction>{evaluation.instruction}</Instruction>
						<Form>
							{evaluation.rating && evaluation.rating.length > 0 && (
								<Section>
									<SectionTitle>Ratings</SectionTitle>
									{evaluation.rating.map((item) => (
										<QuestionWrapper key={item.questionId}>
											<Question>{item.question}</Question>
											<Answers>
												{item.answers.map((answer, i) => (
													<Answer key={i}>
														<Label>
															<Input
																type="radio"
																name={item.questionId}
																value={answer}
																checked={
																	responses.rating.find(
																		(res) => res.questionId == item.questionId
																	)?.value == answer
																}
																disabled
															/>
															{answer}
														</Label>
													</Answer>
												))}
											</Answers>
										</QuestionWrapper>
									))}
								</Section>
							)}
							{evaluation.comment && evaluation.comment.length > 0 && (
								<Section>
									<SectionTitle>Comments</SectionTitle>
									{evaluation.comment.map((item) => (
										<QuestionWrapper key={item.questionId}>
											<Question>{item.question}</Question>
											<CommentBox
												value={
													responses.comment.find(
														(res) =>
															res.questionId == item.questionId
													)?.value
												}
												disabled
											/>
										</QuestionWrapper>
									))}
								</Section>
							)}
						</Form>
					</>
				) : (
					<Loading>Loading...</Loading>
				)}
			</Wrapper>

			{errorMessage && (
				<ErrorModal
					message={errorMessage}
					onClose={() => setErrorMessage(null)}
				/>
			)}

			{successMessage && (
				<SuccessModal
					message={successMessage}
					onClose={() => {
						setSuccessMessage(null);
						navigate(-1);
					}}
				/>
			)}
		</Container>
	);
};

export default SeeResponse;

const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #f4f4f9;
	padding: 1em;
`;

const Wrapper = styled.div`
	width: 100%;
	max-width: 768px;
	background: #fff;
	padding: 2em;
	border-radius: 8px;
	box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
	overflow-y: auto;

	&::-webkit-scrollbar {
		display: none;
	}

	@media (max-width: 768px) {
		width: 100%;
		max-width: 100%;
		padding: 1em;
	}
`;

const Instruction = styled.p`
	font-size: 1.4em;
	margin-bottom: 1em;
	color: #333;
	background-color: #e7f1ff;
	padding: 0.5em;
	border-radius: 4px;

	@media (max-width: 469px) {
		font-size: 1.2rem;
	}
`;

const Form = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.5em;
`;

const Section = styled.div`
	margin-bottom: 2em;
`;

const SectionTitle = styled.h2`
	font-size: 1.5em;
	margin-bottom: 1em;
	color: #444;
`;

const QuestionWrapper = styled.div`
	margin-bottom: 1.5em;
`;

const Question = styled.p`
	font-size: 1.3em;
	margin-bottom: 0.5em;
	color: #555;
	background-color: #f1f1f1;
	padding: 0.5em;
	border-radius: 4px;

	@media (max-width: 468px) {
		font-size: 1.1rem;
	}
`;

const Answers = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5em;
`;

const Answer = styled.div``;

const Label = styled.label`
	display: flex;
	align-items: center;
	gap: 0.5em;
	font-size: 1em;
	color: #555;
`;

const Input = styled.input`
	margin-right: 0.5em;
`;

const CommentBox = styled.textarea`
	width: 100%;
	height: 100px;
	padding: 0.5em;
	border: 1px solid #ccc;
	border-radius: 4px;
	resize: none;
	font-size: 1em;
	color: #555;

	&:focus {
		outline: none;
		border-color: dodgerblue;
	}
`;

const Loading = styled.p`
	font-size: 1.2em;
	color: #777;
`;
