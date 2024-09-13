import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { IoIosCloseCircle, IoIosCheckmarkCircle } from "react-icons/io";
import { FaTrashAlt, FaEdit, FaCheckCircle } from "react-icons/fa";

const CommentComponent = ({
  questionData,
  questions,
  setQuestions,
  setErrorMessage,
  event,
  releasable,
}) => {
  const { question, questionId, saved } = questionData;
  const [text, setText] = useState(question);
  const [disbleInput, setDisableInput] = useState(false);

  useEffect(() => {
    setDisableInput(saved);
  }, [questionData]);

  const handleEdit = () => {
    setDisableInput(!disbleInput);
  };

  const handleDelete = () => {
    const updatedComment = [...questions.comment];
    const newComment = updatedComment.filter((q) => q.questionId != questionId);
    setQuestions({ ...questions, comment: newComment || [] });
  };

  const handleSave = () => {
    if (!text || text === "") {
      setErrorMessage("Invalid Question.");
      return;
    }

    // Find the index of the question with the matching questionId
    const commentIndex = questions.comment.findIndex(
      (c) => c.questionId === questionId
    );

    // If the question with the given questionId is found
    if (commentIndex !== -1) {
      // Create a copy of the questions array
      const updatedComment = [...questions.comment];

      // Update the question at the found index
      updatedComment[commentIndex] = {
        ...updatedComment[commentIndex],
        question: text,
        saved: true,
      };

      // Update the state with the updated questions array
      setQuestions({ ...questions, comment: updatedComment });
    } else {
      // Handle the case when the question with the given questionId is not found
      console.error("Question not found with ID:", questionId);
    }
  };

  return (
    <CommentField>
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
      <CommentInput
        placeholder="Enter something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disbleInput}
      />
    </CommentField>
  );
};

export default CommentComponent;

const CommentField = styled.div`
  padding: 1em;
  box-shadow: 0px 0px 3px 0px rgba(0, 0, 0.6);
  border-radius: 0.3em;
  position: relative;
  margin: 1em 0;
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

const CommentInput = styled.input`
  width: 100%;
  font-size: 1rem;
  padding: 1em;
  border: none;
  outline: none;
  border-bottom: 2px solid dodgerblue;
`;
