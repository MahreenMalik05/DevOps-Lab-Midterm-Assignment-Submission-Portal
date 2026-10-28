
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Store submissions while the server is running.
let submissions = [];

// Read JSON data sent by the browser.
app.use(express.json());

// Serve files from the public folder.
app.use(express.static(path.join(__dirname, "public")));

// Check whether a submission URL is valid.
function isValidUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

// Return all saved submissions.
app.get("/api/submissions", (req, res) => {
  res.json(submissions);
});

// Receive and validate a new submission.
app.post("/api/submissions", (req, res) => {
  const {
    name,
    registrationNumber,
    assignmentTitle,
    submissionUrl
  } = req.body;

  // Check that all required fields are provided.
  if (
    !name?.trim() ||
    !registrationNumber?.trim() ||
    !assignmentTitle?.trim() ||
    !submissionUrl?.trim()
  ) {
    return res.status(400).json({
      message: "All fields are required."
    });
  }

  // Reject an invalid submission URL.
  if (!isValidUrl(submissionUrl.trim())) {
    return res.status(400).json({
      message: "Please enter a valid HTTP or HTTPS URL."
    });
  }

  // Create a submission record.
  const submission = {
    id: submissions.length + 1,
    name: name.trim(),
    registrationNumber: registrationNumber.trim(),
    assignmentTitle: assignmentTitle.trim(),
    submissionUrl: submissionUrl.trim(),
    submittedAt: new Date().toISOString()
  };

  // Save the valid submission.
  submissions.push(submission);

  return res.status(201).json({
    message: "Assignment submitted successfully!",
    submission
  });
});

// Start the server when this file is run directly.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Assignment Portal running at http://localhost:${PORT}`);
  });
}

// Export the app so automated tests can use it.
module.exports = app;
