import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { ref, get, update } from "firebase/database";
import { db } from "../firebase";
import { isArray } from "chart.js/helpers";

const initialState = {
	events: [],
	upComingEvents: 0,
	accomplishedEvents: 0,
	totalEvents: 0,
	yearlyForecastingArray: [],
	monthlyForeCastingArray: [],
	eventError: null,
};

export const fetchSingleEvent = createAsyncThunk(
	"events/fetchEvents",
	async (uid) => {
		try {
			const eventref = ref(db, `events/${uid}`);
			const snapshot = await get(eventref);

			let event = null;

			if (snapshot.exists()) {
				event = snapshot.val();
			}
			return event;
		} catch (error) {
			console.error("Error Fetch single event:", error.message);
			throw error;
		}
	}
);

export const fetchEvents = createAsyncThunk("events/fetchEvents", async () => {
	const eventsRef = ref(db, "events");
	const snapshot = await get(eventsRef);
	if (snapshot.exists()) {
		const result = snapshot.val();
		const keys = Object.keys(result);
		let arr = [];
		keys.forEach((key) => {
			const data = { uid: key, ...result[key] };
			arr.push(data);
		});

		const sorted = arr.sort(
			(a, b) => new Date(b.startDateTime) - new Date(a.startDateTime)
		);


		return sorted;
	}
});

export const statusListener = createAsyncThunk(
	"events/status-listener",
	async (_, { getState }) => {
		try {
			const { events } = getState().events;

			const currentDateTime = new Date();

			if (!events || !events?.length) {
				return;
			}

			for (const event of events) {
				const { uid, startDateTime, endDateTime } = event;
				const startDateTimeObj = new Date(startDateTime);
				const endDateTimeObj = new Date(endDateTime);

				if (
					startDateTimeObj <= currentDateTime &&
					endDateTimeObj > currentDateTime
				) {
					const currentKeyRef = ref(db, `events/${uid}`);
					await update(currentKeyRef, { status: "Ongoing" });
				} else if (
					startDateTimeObj < currentDateTime &&
					endDateTimeObj <= currentDateTime
				) {
					const currentKeyRef = ref(db, `events/${uid}`);
					await update(currentKeyRef, { status: "Accomplished" });
				}
			}
		} catch (error) {
			console.error("Error in statusListener thunk:", error.message);
			throw error;
		}
	}
);

export const eventSlice = createSlice({
	name: "event",
	initialState,
	reducers: {
		countUpComingEvents: (state) => {
			const currentDate = new Date();
			const placeholder = [];
			if (  state.events?.length <= 0 || !Array.isArray(state.events)) {
				return;
			} else {
				state.events.forEach((event) => {
					const startDateTime = new Date(event.startDateTime);

					if (startDateTime > currentDate) {
						placeholder.push(event);
					}
				});
			}

			console.log(state.events);

			state.upComingEvents = placeholder.length || 0;
		},

		countAccomplishedEvents: (state) => {
			if ( state.events?.length <= 0 || !Array.isArray(state.events)) {
				return;
			}
			const currentDate = new Date();
			const placeholder = [];

			state.events.forEach((event) => {
				const endDateTime = new Date(event.endDateTime);

				if (endDateTime <= currentDate) {
					placeholder.push(event);
				}
			});

			state.accomplishedEvents = placeholder.length || 0;
		},

		countTotalEvents: (state) => {
			if ( state.events?.length <= 0 || !Array.isArray(state.events)) {
				return;
			}

			state.totalEvents = state.events.length;
		},

		setYearlyForcastingEventArray: (state, action) => {
			if ( state.events?.length <= 0 || !Array.isArray(state.events)) {
				return;
			}

			const newEvents = state.events.filter((event) => {
				const startDate = new Date(event.startDateTime).getFullYear();

				if (startDate.toString() == action.payload) {
					return event;
				}
			});
			state.yearlyForecastingArray = newEvents;
		},

		setMonthlyForecastingArray: (state, action) => {
			if ( state.events?.length <= 0 || !Array.isArray(state.events)) {
				return;
			}
			const currentYear = new Date().getFullYear();
			const arr = [];
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

			const thisYearEvent = state.events.filter((event) => {
				const startYear = new Date(event.startDateTime).getFullYear();

				if (parseInt(currentYear) == parseInt(startYear)) {
					return event;
				}
			});

			if (!thisYearEvent || thisYearEvent.length <= 0) {
				return;
			}

			thisYearEvent.forEach((event) => {
				const month = months[new Date(event.startDateTime).getMonth()];

				if (month == action.payload) {
					arr.push(event);
				}
			});
			state.monthlyForeCastingArray = arr;
		},

		clearEventError: (state) => {
			state.eventError = null;
		},

		handleEventStatus: (state) => {},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchEvents.fulfilled, (state, action) => {
				if(!action?.payload || !Array.isArray(action.payload)){
					state.events = []
				}else{

					state.events = action.payload;
				}
			})
			.addMatcher(
				// Matcher to catch any action with a rejected status
				(action) => action.type.endsWith("/rejected"),
				(state, action) => {
					// Set eventError to the error message from the action payload
					state.eventError = action.error.message || "An error occurred";
				}
			);
	},
});

export const {
	countAccomplishedEvents,
	countUpComingEvents,
	countTotalEvents,
	setYearlyForcastingEventArray,
	setMonthlyForecastingArray,
	handleSetEvents,
	clearEventError,
} = eventSlice.actions;

export default eventSlice.reducer;
