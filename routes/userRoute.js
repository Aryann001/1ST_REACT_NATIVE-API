import express from "express";
import {
  addTask,
  forgotPassword,
  getMyProfile,
  login,
  logout,
  register,
  removeTask,
  resetPassword,
  updatePassword,
  updateProfile,
  updateTask,
  verified,
} from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.route(`/register`).post(register);

router.route(`/verify`).post(isAuthenticated, verified);

router.route(`/login`).post(login);

router.route(`/logout`).get(logout);

router.route(`/task/add`).post(isAuthenticated, addTask);

router.route(`/myprofile`).get(isAuthenticated, getMyProfile);

router.route(`/profile/update`).put(isAuthenticated, updateProfile);

router.route(`/password/update`).put(isAuthenticated, updatePassword);

router.route(`/password/forgot`).post(forgotPassword);

router.route(`/password/reset`).put(resetPassword);

router
  .route(`/task/:taskId`)
  .get(isAuthenticated, updateTask)
  .delete(isAuthenticated, removeTask);

export default router;
