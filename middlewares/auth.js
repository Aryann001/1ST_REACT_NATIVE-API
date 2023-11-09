import jwt from "jsonwebtoken";
import catchAsyncError from "./catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/userModel.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { userToken } = req.cookies;

  if (!userToken) {
    return next(new ErrorHandler(`Login to access this resource`, 400));
  }

  const decodedData = jwt.verify(userToken, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData._id);

  next();
});
