import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import Chart from "chart.js/auto"; // Import Chart.js library
import { Bar } from "react-chartjs-2";

import {
  countUpComingEvents,
  countAccomplishedEvents,
  countTotalEvents,
  setYearlyForcastingEventArray,
  setMonthlyForecastingArray,
} from "../app/features/eventSlice";

import { fetchStudentCount } from "../app/features/userSlice";

// firebase
import { db, app } from "../app/firebase";
import { ref, onValue } from "firebase/database";
import LoadingModal from "../components/LoadingModal";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()]
  );
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    upComingEvents,
    accomplishedEvents,
    totalEvents,
    events,
    yearlyForecastingArray,
    monthlyForeCastingArray,
  } = useSelector((state) => state.events);
  const { totalStudent } = useSelector((state) => state.user);


  const dispatch = useDispatch();
  const yearlyForecastingChartRef = useRef(null);

  useEffect(() => {
    dispatch(countUpComingEvents());
    dispatch(countAccomplishedEvents());
    dispatch(countTotalEvents());
  }, [events]);

  useEffect(() => {
    dispatch(fetchStudentCount());
  }, []);

  useEffect(() => {
    // Create or update the chart when the filter changes
    if (yearlyForecastingChartRef.current) {
      const filteredEvents = events.filter(
        (event) => new Date(event.startDateTime).getFullYear() === selectedYear
      );

      const data = Array.from({ length: 12 }, (_, i) => {
        const monthEvents = filteredEvents.filter(
          (event) => new Date(event.startDateTime).getMonth() === i
        );
        return monthEvents.length;
      });

      updateChart(data);
    }
  }, [yearlyForecastingArray, events]);

  useEffect(() => {
    if (selectedYear) {
      dispatch(setYearlyForcastingEventArray(selectedYear));
      dispatch(setMonthlyForecastingArray("May"));
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedMonth) {
      dispatch(setMonthlyForecastingArray(selectedMonth));
    }
  }, [selectedMonth]);

  useEffect(() => {
    const getStatusPercentage = (status) => {
      const total = monthlyForeCastingArray.length;
      const statusCount = monthlyForeCastingArray.filter(
        (item) => item.status === status
      ).length;
      return ((statusCount / total) * 100).toFixed(2);
    };

    const data = {
      labels: ["Scheduled", "Accomplished"],
      datasets: [
        {
          label: "Status Percentage",
          data: [
            getStatusPercentage("Scheduled"),
            getStatusPercentage("Accomplished"),
          ],
          backgroundColor: ["dodgerblue", "lightgreen"],
          hoverBackgroundColor: ["deepskyblue", "limegreen"],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 100, // Set your desired step size here
          },
        },
      },
    };

    setBarData({ data, options });
  }, [monthlyForeCastingArray, events]);

  const updateChart = (data) => {
    const ctx = yearlyForecastingChartRef.current.getContext("2d");

    // Check if there's an existing chart instance
    if (yearlyForecastingChartRef.current.chart) {
      // Destroy the existing chart instance
      yearlyForecastingChartRef.current.chart.destroy();
    }

    // Create a new chart instance
    yearlyForecastingChartRef.current.chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        datasets: [
          {
            label: "Events per Month",
            data: data,
            fill: false,
            borderColor: "dodgerblue",
            tension: 0.1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  };

  const handleChangeYear = (e) => {
    const year = parseInt(e.target.value);

    setSelectedYear(year);
  };

  const Card = ({ number, description }) => {
    return (
      <CardContainer>
        <p>{number}</p>
        <p>{description}</p>
      </CardContainer>
    );
  };

  return (
    <Container>
      <CardWrapper>
        <Card number={upComingEvents} description={"Upcoming Events"} />
        <Card number={accomplishedEvents} description={"Accomplished Events"} />
        <Card number={totalEvents} description={"Total Events Events"} />
        <Card number={totalStudent} description={"Registered User"} />
      </CardWrapper>

      <ChartContainer>
        {/* chart for yearly forecasting */}
        <ChartWrapper>
          <YearSelect value={selectedYear} onChange={handleChangeYear}>
            <option value="">Select Year</option>
            {Array.from({ length: new Date().getFullYear() - 2022 }, (_, i) => (
              <option key={2023 + i} value={2023 + i}>
                {2023 + i}
              </option>
            ))}
          </YearSelect>
          <canvas ref={yearlyForecastingChartRef} className="chart" />
        </ChartWrapper>

        {/* chart for monthly forecasting */}

        <ChartWrapper>
          <MonthSelect
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months &&
              months.map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
          </MonthSelect>
          {barData && barData?.data?.labels && (
            <Bar
              data={barData?.data}
              options={barData.options}
              className="chart"
            />
          )}
        </ChartWrapper>
      </ChartContainer>

      {loading && <LoadingModal />}
    </Container>
  );
};

export default Dashboard;

const Container = styled.div`
  flex: 1;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 2em;
  padding: 1em;
`;

const CardContainer = styled.div`
  flex-basis: 20%;
  max-width: 225px;
  min-width: 150px;
  aspect-ratio: 4 / 4;
  border-radius: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.6);

  & p:first-child {
    font-size: 2rem;
    font-weight: bold;
    color: blue;
    text-align: center;
  }

  & p:last-child {
    font-weight: 600;
    text-align: center;
  }
`;

const ChartContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1em;
`;

const YearSelect = styled.select`
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
  width: auto;
  background: dodgerblue;
  color: white;
  padding: 0.3em 0.5em;
  text-align: center;
  outline: 1px solid;

  &:focus {
    outline-color: red;
  }

  &::placeholder {
    color: white;
  }
`;

const ChartWrapper = styled.div`
  min-width: 40%;
  max-width: 1000px;
  aspect-ratio: 4 / 3;
  displaay: flex;
  flex-direction column;
  flex-shrink: 0;
  flex-grow: 0;

  & .chart {
    box-shadow: 0px 0px 10px 0px dodgerblue;
    
  }
`;

const MonthSelect = styled(YearSelect)`
  text-align: left;
`;
