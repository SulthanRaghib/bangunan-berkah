const app = require("./src/app");
const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`🚀 Auth Service running on port ${PORT}`);
});
