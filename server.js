import app from "./app.js";
import DB from "./config/database.js";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

process.on("uncaughtException", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting down the server...`);

  process.exit(1);
});

dotenv.config({
  path: `./config/config.env`,
});

DB();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const server = app.listen(process.env.PORT, () =>
  console.log(`Server is running on Port: ${process.env.PORT}`)
);

process.on("unhandledRejection", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting down the server...`);

  server.close(() => process.exit(1));
});
