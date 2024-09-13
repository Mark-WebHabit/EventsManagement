// InputGroup.js
import React from "react";
import styled from "styled-components";

const InputGroup = ({
  type,
  placeholder,
  name,
  value,
  onChange,
  icon: Icon,
  options,
  disabled,
  title = null,
  pattern = null
}) => (
  <InputWrapper>
    {Icon && <Icon className="icon" />}
    {type === "select" ? (
      <Select name={name} value={value} onChange={onChange} disabled={disabled}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options &&
          options.length >= 0 &&
          options.map((option, i) => (
            <option key={i} value={option.value}>
              {option}
            </option>
          ))}
      </Select>
    ) : (
      <Input
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        required
        title={title}
        pattern={pattern}
      />
    )}
  </InputWrapper>
);

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  width: 100%;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  padding-left: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  color: #333;
  transition: border-color 0.3s;
  margin-left: 0.5em;

  &:focus {
    border-color: #007bff;
    outline: none;
  }

  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  padding-left: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  color: #333;
  background-color: #fff;
  transition: border-color 0.3s;
  margin-left: 0.5em;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

export default InputGroup;
