import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { app, db } from "../firebase";
import { ref, orderByChild, equalTo, query, get } from "firebase/database";
import { getAuth } from "firebase/auth";

// Async thunk action to fetch all users with role "student" and set the total to the state
export const fetchStudentCount = createAsyncThunk(
  "user/fetchStudentCount",
  async () => {
    const userRef = ref(db, "users");
    const userQuery = query(userRef, orderByChild("role"), equalTo("student"));

    const snapshot = await get(userQuery);

    // Check if snapshot exists and extract the number of children
    let studentCount = 0;
    if (snapshot.exists()) {
      const students = snapshot.val();
      const keys = Object.keys(students);

      studentCount = keys.length;
    }

    return studentCount;
  }
);

export const handleGetAuthUser = createAsyncThunk("user/auth", async () => {
  const auth = getAuth(app);
  let dt = {};


  if (auth.currentUser?.uid) {
    const userRef = ref(db, `users/${auth.currentUser.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const data = snapshot.val();

      if (data?.username) {
        dt = {
          email: auth.currentUser.email,
          uid: auth.currentUser.uid,
          role: data?.role,
        };
      }
    }
  }
  return dt;
});

// Define a slice to manage the state and reducers
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    totalStudent: 0,
    userError: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    clearUserError: (state) => {
      state.userError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentCount.fulfilled, (state, action) => {
        state.totalStudent = action.payload || 0;
      })
      .addCase(handleGetAuthUser.fulfilled, (state, action) => {
        if (action.payload?.uid) {
          state.user = action.payload;
        } else {
          state.user = null;
        }
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.userError = action.error.message;
        }
      );
  },
});

export const { setUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;
