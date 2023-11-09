import catchAsyncError from "../middlewares/catchAsyncError.js";
import User from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendMail from "../utils/sendMail.js";
import sendToken from "../utils/sendToken.js";
import cloudinary from "cloudinary";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password, avatar } = req.body;

  let avatarData = {
    public_id: "Public_Id",
    url: "/Profile.png",
  };

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler(`User Already Exist`, 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  if (avatar !== undefined) {
    const result = await cloudinary.v2.uploader.upload(avatar, {
      folder: "First React Native App",
    });

    avatarData.public_id = result.public_id;
    avatarData.url = result.secure_url;
  }

  user = await User.create({
    name,
    email,
    password,
    avatar: avatarData,
    otp,
    otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
  });

  await sendMail(email, `Email Verification`, `Your OTP is ${otp}`);

  sendToken(res, user, 200);
});

export const verified = catchAsyncError(async (req, res, next) => {
  const otp = Number(req.body.otp);

  const user = await User.findById(req.user._id);

  if (otp !== user.otp || user.otp_expiry < Date.now()) {
    return next(new ErrorHandler(`Invalid OTP`, 400));
  }

  user.verified = true;
  user.otp = null;
  user.otp_expiry = null;

  await user.save();

  sendToken(res, user, 200);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler(`Enter Email and Password`, 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler(`Invalid Email and Password`, 400));
  }

  const matchedPassword = await user.comparePassword(password);

  if (!matchedPassword) {
    return next(new ErrorHandler(`Invalid Email and Password`, 400));
  }

  sendToken(res, user, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("userToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "Production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "Production" ? true : false,
    })
    .json({
      success: true,
      message: `Logout Successfully`,
    });
});

export const addTask = catchAsyncError(async (req, res, next) => {
  const { title, description } = req.body;

  const user = await User.findById(req.user._id);

  user.tasks.push({
    title,
    description,
    completed: false,
    createdAt: new Date(Date.now()),
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: `Task Added Successfully`,
  });
});

export const removeTask = catchAsyncError(async (req, res, next) => {
  const { taskId } = req.params;

  const user = await User.findById(req.user._id);

  user.tasks = user.tasks.filter(
    (task) => task._id.toString() !== taskId.toString()
  );

  await user.save();

  res.status(200).json({
    success: true,
    message: `Task Removed Successfully`,
  });
});

export const updateTask = catchAsyncError(async (req, res, next) => {
  const { taskId } = req.params;

  const user = await User.findById(req.user._id);

  const userTask = user.tasks.find(
    (task) => task._id.toString() === taskId.toString()
  );

  userTask.completed = !userTask.completed;

  await user.save();

  res.status(200).json({
    success: true,
    message: `Task Updated Successfully`,
  });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  sendToken(res, user, 200);
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, avatar } = req.body;

  const user = await User.findById(req.user._id);

  if (name) {
    user.name = name;
  }

  if (avatar) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    const result = await cloudinary.v2.uploader.upload(avatar, {
      folder: "First React Native App",
    });

    user.avatar.public_id = result.public_id;
    user.avatar.url = result.secure_url;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: `Profile Updated Successfully`,
  });
});

export const updatePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler(`Enter All Fields`, 400));
  }

  const user = await User.findById(req.user._id).select("+password");

  const isMatched = await user.comparePassword(oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler(`Old Password Is Incorrect`));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler(`Passwords Doesn't Match`));
  }

  user.password = newPassword;

  await user.save();

  sendToken(res, user, 200);
});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler(`User Doesn't Exist`, 400));
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  user.resetPasswordOtp = otp;
  user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendMail(email, `Forgot Password`, `Your OTP is ${otp}`);

  res.status(200).json({
    success: true,
    message: `OTP is Sent to ${email}`,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { otp, newPassword, confirmPassword } = req.body;

  const user = await User.findOne({
    resetPasswordOtp: otp,
    resetPasswordOtpExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler(`Invalid OTP or OTP has been Expired`, 400));
  }

  if (!newPassword || !confirmPassword) {
    return next(new ErrorHandler(`Enter All Fields`, 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler(`Passwords Doesn't Match`));
  }

  user.password = newPassword;
  user.resetPasswordOtp = null;
  user.resetPasswordOtpExpiry = null;

  await user.save();

  sendToken(res, user, 200);
});
