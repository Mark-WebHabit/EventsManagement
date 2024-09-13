import React from "react";
import styled from "styled-components";
import { QRCodeCanvas } from "qrcode.react";
import { formatDateTime } from "../utilities/date";
const EventCard = ({ card, handleCardClick }) => {
  return (
    <CardWrapper
      $bg={card.picture ? card.picture : "/placeholder.jpg"}
      $status={card.status}
      onClick={() => handleCardClick(card)}
    >
      <QRCodeCanvas
        value={`${window.location.origin}/event/${card.uid}`}
        style={{ display: "none" }}
      />

      <div className="wrapper">
        <p className="title">{card.title}</p>
        <div className="rest">
          <div className="rest-wrapper">
            <p className="status">{card.status}</p>
            <div className="dates">
              <span className="date">
                Start: <span>{formatDateTime(card.startDateTime)}</span>
              </span>
              <span className="date">
                End: <span>{formatDateTime(card.endDateTime)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export default EventCard;

const CardWrapper = styled.div`
  width: 30%;
  max-width: 250px;
  aspect-ratio: 4 / 5;
  border-radius: 1.5em;
  overflow: hidden;
  background: url(${(props) => props.$bg}) no-repeat center center / cover;
  cursor: pointer;
  transition: all 200ms;
  box-shadow: 0px 0px 5px 2px
    ${(props) =>
      props.$status === "Accomplished"
        ? "rgba(0,255,0, 0.6)"
        : props.$status === "Ongoing"
        ? "rgba(0,0,255, 0.6)"
        : "rgba(255,0,0, 0.6)"};

  &:hover {
    scale: 0.9;
  }

  & .wrapper {
    height: 100%;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;

    & .title {
      padding: 0.4em;
      background-color: white;
      font-size: 1.1rem;
      text-align: center;
      text-transform: capitalize;
    }

    & .rest {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;

      & .rest-wrapper {
        display: flex;
        flex-direction: column;
        background: white;
        padding: 0.5em;

        & .status {
          text-align: center;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        & .dates {
          display: flex;
          flex-direction: column;

          & .date {
            font-weight: bold;
            text-transform: uppercase;
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;

            & span {
              font-weight: normal;
              text-transform: capitalize;
            }
          }
        }
      }
    }
  }
`;
