import express from "express";
import dotenv from "dotenv";
import errorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";

const app = express();

dotenv.config({
  path: `./config/config.env`,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

import UserRoute from "./routes/userRoute.js";

app.use(`/api/v1`, UserRoute);

app.use(errorMiddleware);

export default app;
