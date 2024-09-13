const express = require("express");
const app = express();
const cors = require('cors')
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs").promises; // For file operations
const { format, set } = require("date-fns");
const {  storage, db } = require("./firebase.js");
const {
	getStorage,
	ref,
	uploadBytes,
	getDownloadURL,
} = require("firebase/storage");
const {
	get,
	ref: databaseRef,
	orderByChild,
	equalTo,
	query,
	push,
	set: databaseSet,
} = require("firebase/database");

const PORT = 8080;


// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors())

const path = require("path");
const pdfPath = path.resolve(__dirname, "template.pdf");

function toTitleCase(str) {
	return str.replace(
		/\b\w+/g,
		(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
	);
}

function formatDate(inputDate) {
	const date = new Date(inputDate);
	const options = { year: "numeric", month: "long", day: "numeric" };
	return date.toLocaleDateString(undefined, options);
}

// Route to handle PDF editing
app.get("/edit-pdf", async (req, res) => {
	const event = req.query.event || null;

	if (!event) return res.json({ success: false, message: "Event not found" });

	try {
		const eventRef = databaseRef(db, `events/${event}`);

		const eventSnapshot = await get(eventRef);

		if (!eventSnapshot.exists()) {
			return res.json({ success: false, message: "Event not found" });
		}

		// event data =====================================================
		const eventData = await eventSnapshot.val();

		// get all attendace record of the selected event
		// attendance data =================================================
		let attendace = [];
		const attendanceRef = await databaseRef(db, "attendance");
		const attendaceQuery = query(
			attendanceRef,
			orderByChild("eventId"),
			equalTo(event)
		);
		const attendaceSnapshot = await get(attendaceQuery);

		if (attendaceSnapshot.exists()) {
			const attendaceData = attendaceSnapshot.val();
			const attendaceKeys = Object.keys(attendaceData);

			attendaceKeys.forEach((key) => {
				attendace.push({ uid: key, ...attendaceData[key] });
			});
		}

		if (!attendace || attendace.length < 1) {
			return res.json({
				success: false,
				message: "No attendance were found in the record",
			});
		}

		// get the event evaluation
		const evaulationRef = databaseRef(db, `evaluation/${event}`);
		const evaluationSnapshot = await get(evaulationRef);

		if (!evaluationSnapshot.exists()) {
			return res.json({
				success: false,
				message: "No Evaluation Found for this event",
			});
		}

		// evaluation data ================================================
		const evaluation = evaluationSnapshot.val();

		// get all response
		const responsesRef = databaseRef(db, `responses`);
		const responseQuery = query(
			responsesRef,
			orderByChild("evaluationId"),
			equalTo(event)
		);
		const responsesSnapshot = await get(responseQuery);

		if (!responsesSnapshot.exists()) {
			return res.json({
				success: false,
				message: "No one has responded to the evaluation",
			});
		}

		const responsesData = responsesSnapshot.val();
		// resposnes data ==========================================
		const responses = Object.keys(responsesData).map((key) => ({
			key,
			...responsesData[key],
		}));

		// Fetch user data for each response
		const usersContainer = [];
		for (const response of responses) {

			const userRef = databaseRef(db, `users/${response.userId}`);
			const userSnapshot = await get(userRef);

			if (userSnapshot.exists()) {
				const user = userSnapshot.val();
				usersContainer.push({ key: response.userId, user });
			}
		}

		if (!usersContainer || usersContainer.length < 1) {
			return res.json({ success: false, message: "User not found" });
		}

		const dateDistributed = new Date();
		const formattedDateDistributed = format(
			dateDistributed,
			"do 'of' MMMM yyyy"
		);

		// Iterate over users and generate PDF for each
		for (const { key, user } of usersContainer) {
			try {
				// Read the PDF file
				const pdfBytes = await fs.readFile(pdfPath);

				// Edit PDF
				const pdfDoc = await PDFDocument.load(pdfBytes);

				// Use fonts
				const timesRomanBold = await pdfDoc.embedFont(
					StandardFonts.TimesRomanBold
				);
				const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

				const pages = pdfDoc.getPages();
				const firstPage = pages[0];

				// Main name text
				const name = user.fullName;
				const nameFontSize = 35;

				// Additional text 1
				const line1 = `"${toTitleCase(eventData.title)}"`;
				const line1FontSize = 16;

				// Additional text 2
				const line2 = `Held on ${formatDate(eventData.startDateTime)}`;
				const line2FontSize = 16;

				const line3 = `Given this ${formattedDateDistributed},`;
				const line3FontSize = 18;

				// Draw texts on PDF
				let y = 340;
				let textWidth = timesRomanBold.widthOfTextAtSize(name, nameFontSize);
				let x = (firstPage.getSize().width - textWidth) / 2;

				firstPage.drawText(name, {
					x,
					y,
					size: nameFontSize,
					font: timesRomanBold,
					color: rgb(255 / 255, 102 / 255, 0 / 255),
				});

				y -= 50;
				textWidth = timesRoman.widthOfTextAtSize(line1, line1FontSize);
				x = (firstPage.getSize().width - textWidth) / 2 - 10;

				firstPage.drawText(line1, {
					x,
					y,
					size: line1FontSize,
					font: timesRomanBold,
					color: rgb(60 / 255, 81 / 255, 121 / 255),
				});

				y -= 20;
				textWidth = timesRoman.widthOfTextAtSize(line2, line2FontSize);
				x = (firstPage.getSize().width - textWidth) / 2;

				firstPage.drawText(line2, {
					x,
					y,
					size: line2FontSize,
					font: timesRoman,
					color: rgb(60 / 255, 81 / 255, 121 / 255),
				});

				y -= 65;
				textWidth = timesRoman.widthOfTextAtSize(line3, line3FontSize);
				x = (firstPage.getSize().width - textWidth) / 2;

				firstPage.drawText(line3, {
					x,
					y,
					size: line3FontSize,
					font: timesRoman,
					color: rgb(60 / 255, 81 / 255, 121 / 255),
				});

				// Save modified PDF to a base64 string
				const pdfBytesBase64 = await pdfDoc.saveAsBase64();

				// Upload file to Firebase Storage
				const storageRef = ref(storage, `pdfs/${key}${new Date().toString()}${Math.random() * 100}-attendance.pdf`);
				await uploadBytes(storageRef, Buffer.from(pdfBytesBase64, "base64"));

				// Get download URL
				const downloadURL = await getDownloadURL(storageRef);

				const obj = {
					cert: downloadURL,
					dateReceived: dateDistributed.toISOString(),
					userId: key,
					eventId: event,
				};

				const newCert = await push(databaseRef(db, "certificates"));

				// Get the key of the newly pushed certificate
				const newCertKey = newCert.key;

				// Set the certificate key in the database under its own key
				await databaseSet(databaseRef(db, `certificates/${newCertKey}`), obj);
			} catch (error) {
				console.log(
					`Error pdf generation for: ${user.fullName}: ${error.message}`
				);
			}
		}
		res.json({ success: true, message: "Certicate Generated and Distributed" });
	} catch (error) {
		console.error("Error editing PDF:", error);
		res.status(500).send("Error editing PDF");
	}
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
