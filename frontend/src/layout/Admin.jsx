import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import styled from "styled-components";

// firebase
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { get, ref, onValue } from "firebase/database";
import { app, db } from "../app/firebase.js";

// component
import ErrorModal from "../components/ErrorModal.jsx";

// rtk
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, statusListener } from "../app/features/eventSlice";
import { setUser } from "../app/features/userSlice.js";
import {
  clearUserError,
  handleGetAuthUser,
} from "../app/features/userSlice.js";
import { clearEventError } from "../app/features/eventSlice";
import LoadingModal from "../components/LoadingModal.jsx";

const Admin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userError } = useSelector((state) => state.user);
  const { eventError } = useSelector((state) => state.events);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);

        const snapshot = (await get(userRef)).val();

        if (snapshot?.role != "admin") {
          navigate("/student");
        } else {
          dispatch(handleGetAuthUser());
        }
      } else {
        navigate("/login");
        await signOut(auth);
      }
      setLoading(false);
    });

    // Clean up the listener to prevent memory leaks
    return () => unsubscribe();
  }, [navigate]);

  // initialize the events state for all admin pages
  useEffect(() => {
    const eventsRef = ref(db, "events");

    onValue(eventsRef, (snapshot) => {
      dispatch(fetchEvents());
    });
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(statusListener());
  }, [currentDateTime]);

  const handleClearModal = () => {
    if (userError) {
      dispatch(clearUserError());
    }

    if (eventError) {
      dispatch(clearEventError());
    }
  };
  return (
    <Container>
      <AdminHeader />
      <Wrapper className="adminWrapper">
        <Outlet />
      </Wrapper>
      {userError && (
        <ErrorModal message={userError} onClose={handleClearModal} />
      )}
      {eventError && (
        <ErrorModal message={eventError} onClose={handleClearModal} />
      )}
      {loading && <LoadingModal />}
    </Container>
  );
};

export default Admin;

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
`;

const Wrapper = styled.div`
  &.adminWrapper {
    flex: 1;
    display: flex;

    & > div {
      flex: 1;
    }
  }
`;
