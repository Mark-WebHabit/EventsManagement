import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
// Import your SVG icon as an image
import ConfirmationIcon from "/request.svg";

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  const handleCancel = () => {
    setConfirmed(false);
    onCancel();
  };

  return (
    <Container>
      <ModalWrapper>
        {/* Use the imported SVG icon as an image */}
        <IconWrapper>
          <Icon src={ConfirmationIcon} alt="Confirmation Icon" />
        </IconWrapper>
        <Message>{message}</Message>
        <ButtonWrapper>
          <CancelButton onClick={handleCancel}>Cancel</CancelButton>
          <ConfirmButton onClick={handleConfirm}>Confirm</ConfirmButton>
        </ButtonWrapper>
      </ModalWrapper>
    </Container>
  );
};

export default ConfirmationModal;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ModalWrapper = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  animation: ${fadeIn} 0.3s ease;
`;

const IconWrapper = styled.div`
  margin-bottom: 20px;
`;

// Style the img tag for the icon
const Icon = styled.img`
  width: 60px;
  height: 60px;
  fill: #ffc107;
`;

const Message = styled.p`
  font-size: 18px;
  color: #ffc107;
  margin-bottom: 20px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const CancelButton = styled.button`
  background-color: #f44336;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #d32f2f;
  }
`;

const ConfirmButton = styled.button`
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #388e3c;
  }
`;
