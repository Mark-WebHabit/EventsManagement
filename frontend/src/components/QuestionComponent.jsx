import React from "react";
import { useState, useEffect } from "react";
import styled from "styled-components";

import { IoIosCloseCircle, IoIosCheckmarkCircle } from "react-icons/io";
import { FaTrashAlt, FaEdit, FaCheckCircle } from "react-icons/fa";

const QuestionComponent = ({
  questionData,
  questions,
  setQuestions,
  setErrorMessage,
  event,
  releasable,
}) => {
  const { questionId, saved, question } = questionData;
  const [text, setText] = useState(question);
  const [disbleInput, setDisableInput] = useState(false);

  useEffect(() => {
    setDisableInput(saved);
  }, [questionData]);

  const handleEdit = () => {
    setDisableInput(!disbleInput);
  };

  const handleSave = () => {
    if (!text || text === "") {
      setErrorMessage("Invalid Question.");
      return;
    }

    // Find the index of the question with the matching questionId
    const questionIndex = questions.rating.findIndex(
      (q) => q.questionId === questionId
    );

    // If the question with the given questionId is found
    if (questionIndex !== -1) {
      // Create a copy of the questions array
      const updatedQuestions = [...questions.rating];

      // Update the question at the found index
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        question: text,
        saved: true,
      };

      // Update the state with the updated questions array
      setQuestions({ ...questions, rating: updatedQuestions });
    } else {
      // Handle the case when the question with the given questionId is not found
      console.error("Question not found with ID:", questionId);
    }
  };

  const handleDelete = () => {
    const updatedQuestion = [...questions.rating];
    const newQuestions = updatedQuestion.filter(
      (q) => q.questionId != questionId
    );
    setQuestions({ ...questions, rating: newQuestions || [] });
  };

  return (
    <QuestionField>
      {event && event.status !== "Accomplished" && !releasable && (
        <div className="icons">
          {!saved && (
            <IoIosCloseCircle className="icon" onClick={handleDelete} />
          )}
          {saved && <FaTrashAlt className="icon" onClick={handleDelete} />}
          {!saved && (
            <IoIosCheckmarkCircle className="icon" onClick={handleSave} />
          )}
          {saved && disbleInput && (
            <FaEdit className="icon" onClick={handleEdit} />
          )}

          {saved && !disbleInput && (
            <FaCheckCircle className="icon" onClick={handleSave} />
          )}
        </div>
      )}
      <Input
        placeholder="Add Short Question"
        required
        maxLength={150}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disbleInput}
      />
      <QuestionInput>
        <RadioInput>
          <input type="radio" disabled id="rating1" name="rating" value="1" />
          <label htmlFor="outstanding">Outstanding</label>
        </RadioInput>

        <RadioInput>
          <input type="radio" disabled id="rating2" name="rating" value="2" />
          <label htmlFor="very good">Very good</label>
        </RadioInput>

        <RadioInput>
          <input type="radio" disabled id="rating3" name="rating" value="3" />
          <label htmlFor="good">Good</label>
        </RadioInput>

        <RadioInput>
          <input type="radio" disabled id="rating4" name="rating" value="4" />
          <label htmlFor="fair">Fair</label>
        </RadioInput>

        <RadioInput>
          <input type="radio" disabled id="rating5" name="rating" value="5" />
          <label htmlFor="slightly fair">Slightly fair</label>
        </RadioInput>
      </QuestionInput>
    </QuestionField>
  );
};

export default QuestionComponent;

const QuestionField = styled.div`
  margin: 1em 0;
  box-shadow: 0px 0px 3px 0px rgba(0, 0, 0.6);
  border-radius: 0.3em;
  padding: 1em;
  position: relative;

  & .icons {
    position: absolute;
    top: 0.3em;
    right: 0.5em;
    display: flex;
    align-items: center;
    gap: 1em;

    & .icon {
      font-size: 1.5rem;
      color: green;
      cursor: pointer;

      &:hover {
        color: red;
      }
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1em;
  font-size: 1rem;
  outline: none;
  border: none;
  border-bottom: 2px solid dodgerblue;
  display: inline-block;
  margin-bottom: 0.5em;
`;

const QuestionInput = styled.div`
  display: flex;
  flex-direction: column;
`;

const RadioInput = styled.div`
  margin-bottom: 0.5rem; /* Adjust spacing between radio button inputs */
  display: flex;
  gap: 1em;
  padding-left: 1em;
`;

const Radio = styled.input``;
