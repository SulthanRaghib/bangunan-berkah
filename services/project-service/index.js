const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const PORT = process.env.PORT || 8004;
const SERVICE_NAME = process.env.SERVICE_NAME || "Project Service";

app.get("/", (req, res) => {
  res.json({
    message: `${SERVICE_NAME} is running on port ${PORT}`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ${SERVICE_NAME} running on port ${PORT}`);
});

module.exports = app;
