import React from "react";
import styled from "styled-components";
import { AiOutlineCloseCircle } from "react-icons/ai";

const ErrorModal = ({ message, onClose }) => {
  return (
    <ModalBackdrop>
      <ModalContent>
        <ModalHeader>
          <Title>Error</Title>
          <CloseButton onClick={onClose}>
            <AiOutlineCloseCircle />
          </CloseButton>
        </ModalHeader>
        <ErrorMessage>{message}</ErrorMessage>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default ErrorModal;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  background: #ffcccc; /* Error-indicating color */
  padding: 1.5rem;
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #ff3333; /* Close icon color */
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  color: #660000; /* Error message color */
`;
