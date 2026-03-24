const express = require("express");
const app = express();

// Middleware
app.use(express.json());

// Root route (health check)
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running...",
    timestamp: new Date(),
  });
});


// =============================
// STUDENT LOGIN APIs
// =============================
app.post("/studentlogin", (req, res) => {
  res.send('INSIDE Student Login Page');
});


// =============================
// ASSIGNMENT APIs
// =============================

// Submit Assignment
app.post("/submitassignment", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      message: "title and content are required",
    });
  }

  res.status(201).json({
    message: "Assignment submitted successfully",
    data: {
      title,
      content,
      submittedAt: new Date(),
    },
  });
});

// View Assignment
app.get("/viewassignment", (req, res) => {
  res.json({
    message: "List of assignments",
    data: [
      { id: 1, title: "Math Homework", status: "submitted" },
      { id: 2, title: "English Essay", status: "pending" },
    ],
  });
});


// =============================
// PROFILE APIs
// =============================

// Update Profile
app.put("/studentupdateprofile", (req, res) => {
  const { name, age } = req.body;

  res.json({
    message: "Profile updated successfully",
    data: {
      name: name || "Not updated",
      age: age || "Not updated",
    },
  });
});


// =============================
// ERROR HANDLING
// =============================

// Route not found
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});


// =============================
// START SERVER
// =============================

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`EXPRESS Server Started at http://localhost:${PORT}`);
});