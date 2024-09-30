import dotenv from "dotenv";
dotenv.config();
// require("dotenv").config();

import http from "http";
const app = require("./app");

const port = process.env.PORT || 8000;
app.set("port", port);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
