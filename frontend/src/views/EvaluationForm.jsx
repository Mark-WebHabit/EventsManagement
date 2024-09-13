import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FaInfo } from "react-icons/fa";

import ErrorModal from "../components/ErrorModal";
import SuccessModal from "../components/SuccessModal";
import ConfirmationModal from "../components/ConfimationModal";
import LoadingModal from "../components/LoadingModal";

// component
import QuestionComponent from "../components/QuestionComponent";
import CommentComponent from "../components/CommentComponent";
import { useNavigate, useParams } from "react-router-dom";
import {
  equalTo,
  get,
  onValue,
  orderByChild,
  query,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { db } from "../app/firebase";

const EvaluationForm = () => {
  const [questions, setQuestions] = useState({
    rating: [],
    comment: [],
  });
  const [instruction, setInstruction] = useState("");
  const [addQuestion, setAddQuestion] = useState("rating");
  const [errorMesage, setErrorMessage] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [releasable, setReleasable] = useState(false);

  const [hasEvent, setHasEvent] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const eventRef = ref(db, `events/${id}`);

  useEffect(() => {
    const unsubscribe = onValue(eventRef, (snapshot) => {
      if (!snapshot.exists()) {
        navigate("/404");
      } else {
        const event = snapshot.val();

        setHasEvent(true);
        setEvent(event);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasEvent) {
      return;
    }

    const evaulationRef = ref(db, `evaluation/${id}`);

    const unsubscribe = onValue(evaulationRef, (snapshot) => {
      if (snapshot.exists) {
        const evaluation = snapshot.val();
        if (evaluation) {
          setQuestions(evaluation);
          setInstruction(evaluation.instruction);
          setReleasable(evaluation.release);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hasEvent]);

  const handleAddQuestion = () => {
    const uid = new Date().toISOString();

    if (addQuestion === "rating") {
      if (questions) {
        if (questions?.rating) {
          setQuestions((prev) => ({
            ...prev,
            rating: [
              ...prev.rating,
              {
                questionId: uid,
                question: "",
                answers: [
                  "outstanding",
                  "very good",
                  "good",
                  "fair",
                  "slightly fair",
                ],
                saved: false,
                type: addQuestion,
              },
            ],
          }));
        } else {
          setQuestions((prev) => ({
            ...prev,
            rating: [
              {
                questionId: uid,
                question: "",
                answers: [
                  "outstanding",
                  "very good",
                  "good",
                  "fair",
                  "slightly fair",
                ],
                saved: false,
                type: addQuestion,
              },
            ],
          }));
        }
      } else {
        setQuestions((prev) => ({
          ...prev,
          rating: [
            {
              questionId: uid,
              question: "",
              answers: [
                "outstanding",
                "very good",
                "good",
                "fair",
                "slightly fair",
              ],
              saved: false,
              type: addQuestion,
            },
          ],
        }));
      }
    } else if (addQuestion === "comment") {
      if (questions) {
        if (questions?.comment) {
          setQuestions((prev) => ({
            ...prev,
            comment: [
              ...prev.comment,
              {
                questionId: uid,
                saved: false,
                question: "",
                type: addQuestion,
              },
            ],
          }));
        } else {
          setQuestions((prev) => ({
            ...prev,
            comment: [
              {
                questionId: uid,
                saved: false,
                question: "",
                type: addQuestion,
              },
            ],
          }));
        }
      } else {
        setQuestions((prev) => ({
          ...prev,
          comment: [
            {
              questionId: uid,
              saved: false,
              question: "",
              type: addQuestion,
            },
          ],
        }));
      }
    }
  };

  const handleCancel = () => {
    setConfirmationAction(() => () => navigate(`/admin/events/${id}`));
    setShowConfirmation(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setConfirmationAction(() => async () => {
      let savedRating = [];
      let savedComment = [];
      if (questions?.rating) {
        savedRating = questions.rating.filter((q) => q.saved == true);
      }

      if (questions?.comment) {
        savedComment = questions.comment.filter((c) => c.saved == true);
      }

      if (savedRating.length < 1 && savedComment.length < 1) {
        setErrorMessage("There's no questions to save");
        return;
      }

      if (!instruction || instruction == "") {
        setErrorMessage("Please provide an instruction.");
        return;
      }

      setLoading(true);

      try {
        const evaluationRef = ref(db, `evaluation/${id}`);
        await set(evaluationRef, {
          ["instruction"]: instruction,
          rating: savedRating,
          comment: savedComment,
          release: false,
        });

        setSuccessMessage("Evaulation Form submitted");
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    });
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (confirmationAction) {
      confirmationAction();
    }
    setShowConfirmation(false);
  };

  const handleCancelConfirm = () => {
    setShowConfirmation(false);
  };

  const handleReleaseForm = async () => {
    setConfirmationAction(() => async () => {
      setLoading(true);
      try {
        const evaluationRef = ref(db, `evaluation/${id}`);
        const snapshot = await get(evaluationRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          if (data) {
            const release = data.release;
            if (!release) {
              await update(evaluationRef, {
                release: true,
              });

              setSuccessMessage("Form Released.");
            } else {
              const confirmation = confirm(
                "This action will delete stundent's response"
              );

              if (!confirmation) {
                setErrorMessage("Operation Cancelled");
                return;
              }

              const responsesRef = ref(db, "responses");

              const responsesRefQuery = query(
                responsesRef,
                orderByChild("evaluationId"),
                equalTo(id)
              );

              const snapshot = await get(responsesRefQuery);

              if (snapshot.exists()) {
                const responses = snapshot.val();
                const keys = Object.keys(responses);

                for (let i = 0; i < keys.length; i++) {
                  const key = keys[i];
                  // const reposnseRef = ref(
                  //   db,
                  //   `responses/${responses[key].evaluationId}`
                  // );
                  const reposnseRef = ref(db, `responses/${key}`);

                  await remove(reposnseRef);

                  await update(evaluationRef, {
                    release: false,
                  });
                }
              } else {
                await update(evaluationRef, {
                  release: false,
                });
              }

              setSuccessMessage("Form can now be altered.");
            }
          } else {
            setErrorMessage("No Saved Form To Release.");
            return;
          }
        } else {
          setErrorMessage("No Saved Form To Release.");
          return;
        }
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    });

    setShowConfirmation(true);
  };

  return (
    <Container>
      {event && event.status !== "Accomplished" && (
        <Release onClick={handleReleaseForm}>
          {!releasable ? "Release Form" : "Alter Form"}
        </Release>
      )}
      <AddFormModal>
        <Title>Create Event Evaluation</Title>
        <div>
          <Direction
            placeholder="Write Short Instruction"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={event && event.status !== "Accomplished" && releasable}
          />
          <span>{200 - instruction.length} characters</span>
        </div>

        {questions?.rating.length > 0 &&
          questions.rating.map((q) => (
            <QuestionComponent
              key={q.questionId}
              questionData={q}
              questions={questions}
              setErrorMessage={setErrorMessage}
              setQuestions={setQuestions}
              event={event}
              releasable={releasable}
            />
          ))}

        {questions &&
          questions?.comment?.length > 0 &&
          questions.comment.map((c) => (
            <CommentComponent
              key={c.questionId}
              questionData={c}
              questions={questions}
              setQuestions={setQuestions}
              setErrorMessage={setErrorMessage}
              event={event}
              releasable={releasable}
            />
          ))}

        {event && event && event.status !== "Accomplished" && !releasable && (
          <AddQuestion>
            <p>Add Question</p>
            <div className="selectWrapper">
              <button type="button" onClick={handleAddQuestion}>
                +
              </button>
              <select
                value={addQuestion}
                onChange={(e) => setAddQuestion(e.target.value)}
              >
                <option value="rating">Rating</option>
                <option value="comment">Comment</option>
              </select>
            </div>
          </AddQuestion>
        )}

        <Buttons>
          {event && event.status !== "Accomplished" && !releasable && (
            <button className="submit" type="submit" onClick={handleSave}>
              SAVE
            </button>
          )}
          <button className="reset" type="reset" onClick={handleCancel}>
            {event && event.status !== "Accomplished" && !releasable
              ? "CANCEL"
              : "BACK"}
          </button>
        </Buttons>
      </AddFormModal>

      {errorMesage && (
        <ErrorModal
          message={errorMesage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      {showConfirmation && (
        <ConfirmationModal
          message="Are you sure you want to proceed?"
          onConfirm={handleConfirm}
          onCancel={handleCancelConfirm}
        />
      )}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {loading && <LoadingModal />}
    </Container>
  );
};

export default EvaluationForm;
const Container = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

const AddFormModal = styled.form`
  flex: 1;
  max-width: 800px;
  margin: 1em 0;
  height: fit-content;
  max-height: 100%;
  overflow-y: scroll;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.7);
  border-radius: 1em;
  padding: 1em;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Title = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1em;
  font-weight: 600;
`;

const Direction = styled.textarea`
  width: 100%;
  height: 100px;
  resize: none;
  padding: 1em;
  border: none;
  outline: none;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.7);
  border-radius: 0.5em;
  font-size: 1rem;
`;

const AddQuestion = styled.div`
  margin-top: 1em;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  & p {
    font-size: 0.9rem;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 0.2em;
  }

  & .selectWrapper {
    display: flex;
    gap: 0.5em;

    & button {
      font-size: 1.2rem;
      padding: 0.4em 1em;
      border: none;
      otline: none;
      background: dodgerblue;
      color: white;
      cursor: pointer;

      &:hover {
        background: red;
      }
    }

    & select {
      padding: 0.4em 1em;
      font-size: 0.9rem;
      border: none;
      otline: none;
      background: dodgerblue;
      color: white;
      cursor: pointer;

      &:hover {
        background: red;
      }
    }
  }
`;

const Buttons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1em;
  padding: 1em;
  margin-top: 1em;

  & button {
    padding: 0.5em 0;
    width: 100px;
    border: none;
    outline: none;
    cursor: pointer;
    transition: all 200ms;
    color: white;
    font-weight: bold;
    border-radius: 0.2em;

    &.submit {
      background: green;
    }
    &.reset {
      background: red;
    }

    &:hover {
      background: dodgerblue;
    }
  }
`;

const Release = styled.button`
  position: absolute;
  right: 1.5em;
  top: 1.5em;
  padding: 0.8em 1.7em;
  font-size: 1.2rem;
  color: white;
  background: red;
  cursor: pointer;
  border: none;
  border-radius: 0.5em;
`;
