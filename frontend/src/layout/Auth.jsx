import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { get, ref } from "firebase/database";
import { db, app } from "../app/firebase";

const Auth = () => {
	const navigate = useNavigate();
	const [isSigningOut, setIsSigningOut] = useState(false);

	useEffect(() => {
		const auth = getAuth(app);
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user && !isSigningOut) {
				const userRef = ref(db, `users/${user.uid}`);
				const snapshot = (await get(userRef)).val();

				if (snapshot?.role) {
					if (snapshot.role === "admin") {
						navigate("/admin");
					} else if (snapshot.role === "student") {
						navigate("/student");
					}
				}
			}
		});

		// Clean up the listener to prevent memory leaks
		return () => unsubscribe();
	}, [navigate, isSigningOut]);

	return <Outlet />;
};

export default Auth;
