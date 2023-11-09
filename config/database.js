import mongoose from "mongoose";

const DB = () => {
  mongoose
    .connect(process.env.DB_URI, {
      dbName: "FirstMernProjectWithReactNative",
    })
    .then((db) => console.log(`DB is connected to ${db.connection.host}`));
};

export default DB;
