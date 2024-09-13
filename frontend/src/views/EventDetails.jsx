import React, { useEffect, useReducer, useRef, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { formatDateTime } from "../utilities/date";

// firebase
import { app, db } from "../app/firebase";
import {
  ref,
  get,
  query,
  orderByChild,
  equalTo,
  onValue,
  update,
  off,
} from "firebase/database";

// Import the ConfirmationModal component
import ConfirmationModal from "../components/ConfimationModal";

// data
import { courseOptions } from "../../courseOptions.js";

import ErrorModal from "../components/ErrorModal";
import LoadingModal from "../components/LoadingModal";
import EventHeader from "../components/EventHeader.jsx";
import EventDetailTable from "../components/EventDetailTable.jsx";
import { useSelector, useDispatch } from "react-redux";
import { fetchStudentCount } from "../app/features/userSlice.js";
import EventDetailDataCOntainer from "../components/EventDetailDataCOntainer.jsx";

const EventDetails = () => {
  const { id } = useParams();
  const eventsRef = ref(db, `events/${id}`);

  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({});
  const [showTable, setShowTable] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [searchText, setSearchText] = useState(""); // State for search text
  // State to control the visibility of the confirmation modal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // reports
  const [responses, setResponses] = useState([]);

  // get the responses if there is an exisiting evaluation
  useEffect(() => {
    if (!id) {
      return;
    }


    const reponsesRef = ref(db, `responses`);
    const responsesQuery = query(
      reponsesRef,
      orderByChild("evaluationId"),
      equalTo(id)
    );
    get(responsesQuery).then(async (snapshot) => {
      const response = snapshot.val();
      const keys = Object.keys(response)

      let obj = [];

      if (keys?.length > 0) {
        for (let i = 0; i < keys.length; i++) {
          const dt = response[keys[i]];

          const userRef = ref(db, `users/${dt.userId}`);
          const user = await get(userRef);

          if (user.exists()) {
            obj.push({ ...user.val(), uid: user.key, ...dt });
          }
        }
      }

      setResponses(obj || []);
    });
  }, [id]);

  // data initializisation
  useEffect(() => {
    dispatch(fetchStudentCount());
  }, []);

  useEffect(() => {
    const evaluationRef = ref(db, `evaluation/${id}`);

    const unsubscribe = onValue(evaluationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setEvaluation(data);
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [id, db]);

  useEffect(() => {
    async function fetchEventData() {
      setLoading(true);
      try {
        const snapshot = (await get(eventsRef)).val();
        if (!snapshot) {
          setErrorMessage("Event not found");
          return;
        }
        setEventData(snapshot);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    function listenForEventChanges() {
      onValue(eventsRef, (snapshot) => {
        const event = snapshot.val();
        if (event) {
          setEventData(event);
        } else {
          setErrorMessage("Event not found");
        }
      });
    }

    function listenForAttendanceChanges() {
      const attendanceQuery = query(
        ref(db, "attendance"),
        orderByChild("eventId"),
        equalTo(id.toString())
      );

      onValue(attendanceQuery, async (snapshot) => {
        if (snapshot.exists()) {
          const attendanceData = snapshot.val();
          const keys = Object.keys(attendanceData);
          const fetchedData = await Promise.all(
            keys.map(async (key) => {
              const attendanceRecord = attendanceData[key];
              const studentRef = ref(db, `users/${attendanceRecord.userId}`);
              const userSnapshot = await get(studentRef);
              if (userSnapshot.exists()) {
                const user = userSnapshot.val();
                return { ...attendanceRecord, ...user, attendanceId: key };
              }
              return null;
            })
          );
          setData(fetchedData.filter((item) => item !== null));
        } else {
          setErrorMessage("No attendance records found for this event.");
        }
      });
    }

    fetchEventData();
    listenForEventChanges();
    listenForAttendanceChanges();

    // Cleanup listeners on component unmount
    return () => {
      off(eventsRef);
      const attendanceQueryRef = query(
        ref(db, "attendance"),
        orderByChild("eventId"),
        equalTo(id.toString())
      );
      off(attendanceQueryRef);
    };
  }, [id]);

  // Function to handle opening the confirmation modal
  const handleOpenConfirmationModal = () => {
    setShowConfirmationModal(true);
  };

  // Function to handle closing the confirmation modal
  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  // Function to handle turning off attendance
  const hadnleToggleAttendance = async () => {
    // Close the confirmation modal
    handleCloseConfirmationModal();
    // Perform the action to turn off attendance
    const eventRef = ref(db, `events/${id}`);


    await update(eventRef, {
			openAttendance: !eventData.openAttendance,
		});
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Function to handle search input change
  const handleSearchInputChange = (e) => {
    setSearchText(e.target.value);
  };
  return (
		<Container>
			<EventHeader
				eventData={eventData}
				searchText={searchText}
				handleSearchInputChange={handleSearchInputChange}
				handleCourseChange={handleCourseChange}
				selectedCourse={selectedCourse}
				handleOpenConfirmationModal={handleOpenConfirmationModal}
				showTable={showTable}
				setShowTable={setShowTable}
				evaluation={evaluation}
				id={id}
			/>
			{showTable && data.length > 0 && (
				<EventDetailTable
					data={data}
					selectedCourse={selectedCourse}
					searchText={searchText}
				/>
			)}

			{/* Render the ConfirmationModal if showConfirmationModal state is true */}
			{showConfirmationModal && (
				<ConfirmationModal
					message={`Are you sure you want to turn ${eventData.openAttendance ? 'off' : 'on'} attendance?`}
					onConfirm={hadnleToggleAttendance} // Pass the hadnleToggleAttendance function as the onConfirm prop
					onCancel={handleCloseConfirmationModal} // Pass the handleCloseConfirmationModal function as the onCancel prop
				/>
			)}

			{errorMessage && (
				<ErrorModal
					message={errorMessage}
					onClose={() => setErrorMessage(null)}
				/>
			)}
			{loading && <LoadingModal />}

			{!showTable && (
				<EventDetailDataCOntainer
					data={data}
					showTable={showTable}
					responses={responses}
					evaluation={evaluation}
				/>
			)}
		</Container>
	);
};

export default EventDetails;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
