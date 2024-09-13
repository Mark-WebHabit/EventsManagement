// FormButton.js
import React from "react";
import styled from "styled-components";

const FormButton = ({ children, loading }) => (
  <Button disabled={loading}>{children}</Button>
);

const Button = styled.button`
  padding: 0.75rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }
`;

export default FormButton;
