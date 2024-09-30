// const mongoose = require("mongoose");
import mongoose from "mongoose";
const express = require("express");
const bodyParser = require("body-parser");

const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");

const cors = require("cors");
const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL, //Frontend Origin
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-requested-With",
    "Accept",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const MONGODB_URL = process.env.MONGODB_URL;

mongoose
  .connect(MONGODB_URL as string)
  .then(() => {
    console.log("Connected to DB!");
  })
  .catch((err: any) => {
    console.log("Conection Failed! ERROR 💥:=>", err);
  });

app.use("/api/user", authRoute);
app.use("/api/post", postRoute);

module.exports = app;
