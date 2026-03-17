const express = require("express");
const app = express();

const PORT = 5000;
const HOST = "0.0.0.0";

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Student Service is running",
  });
});

app.get("/students", (req, res) => {
  res.json({
    message: "Get all students",
    data: [
      { id: 1, name: "Dapravith", subject: "Computer Science" },
      { id: 2, name: "Dara", subject: "Math" },
    ],
  });
});

app.post("/students", (req, res) => {
  res.status(201).json({
    message: "Student created successfully",
    data: req.body,
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
