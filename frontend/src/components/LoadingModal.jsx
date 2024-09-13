import React from "react";
import styled, { keyframes } from "styled-components";
import { AiOutlineLoading } from "react-icons/ai";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingModal = () => {
  return (
    <ModalBackground>
      <ModalContent>
        <LoadingIcon />
        <LoadingText>Loading...</LoadingText>
      </ModalContent>
    </ModalBackground>
  );
};

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoadingIcon = styled(AiOutlineLoading)`
  font-size: 40px;
  color: dodgerblue;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.p`
  font-size: 18px;
  color: rgba(0, 0, 0, 0.8);
`;

export default LoadingModal;
