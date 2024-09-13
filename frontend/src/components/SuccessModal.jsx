import React from "react";
import styled, { keyframes } from "styled-components";
import checkIcon from "/check.svg";

const SuccessModal = ({ onClose, message }) => {
  return (
    <Container>
      <SuccessWrapper>
        <IconWrapper>
          <img src={checkIcon} alt="Success" />
        </IconWrapper>
        <Message>{message}</Message>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </SuccessWrapper>
    </Container>
  );
};

export default SuccessModal;

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
  z-index: 1001;
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

const SuccessWrapper = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  animation: ${fadeIn} 0.3s ease;

  @media (max-width: 400px) {
    width: 80%;
  }
`;

const IconWrapper = styled.div`
  margin-bottom: 20px;

  img {
    width: 60px;
    height: 60px;
    fill: #4caf50; /* Assuming the SVG color is green */
  }
`;

const Message = styled.p`
  font-size: 18px;
  color: #4caf50;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
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
