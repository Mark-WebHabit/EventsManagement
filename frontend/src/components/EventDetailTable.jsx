import React from "react";
import styled from "styled-components";

import { formatDateTime } from "../utilities/date";

const EventDetailTable = ({ data, selectedCourse, searchText }) => {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Username</Th>
          <Th>Student ID</Th>
          <Th>Course</Th>
          <Th>Year</Th>
          <Th>Major</Th>
          <Th>Section</Th>
          <Th>Time In</Th>
        </tr>
      </thead>
      <tbody>
        {data
          .filter(
            (item) =>
              (selectedCourse === "ALL" || item.course === selectedCourse) &&
              (item.studentId.includes(searchText) ||
                item.username.toLowerCase().includes(searchText.toLowerCase()))
          ) // Filter data based on selected course and search text
          .map((data) => (
            <tr key={data.attendanceId}>
              <Td>{data.username}</Td>
              <Td>{data.studentId}</Td>
              <Td>{data.course}</Td>
              <Td>{data.year}</Td>
              <Td>{data.major}</Td>
              <Td>{data.section}</Td>
              <Td>{formatDateTime(data.timeIn)}</Td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};

export default EventDetailTable;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: dodgerblue;
  color: white;
  padding: 1em;
  text-align: left;
`;

const Td = styled.td`
  padding: 1em;
  border-bottom: 1px solid #ddd;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }

  &:hover {
    background-color: #ddd;
  }
`;
