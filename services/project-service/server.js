const app = require("./src/app");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 8004;
const SERVICE_NAME = process.env.SERVICE_NAME || "Project Service";

app.get("/", (req, res) => {
  res.json({ message: `${SERVICE_NAME} is running on port ${PORT}` });
});

app.listen(PORT, () => {
  console.log(`🚀 ${SERVICE_NAME} running on port ${PORT}`);
});

module.exports = app;
