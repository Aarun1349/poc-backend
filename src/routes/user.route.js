import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  loginUser,
  registerUser,
  logoutUser,
  createNewClient,
  createNewAdmin,
  getCurrentUser,
  changeCurrentPassword,
  updateUserDetails,
  refreshAccessToken,
  getCurrentUserRole,
} from "../controllers/user.controller.js";
const userRouter = Router();

// userRouter.route("/addsuperadminuser").post( registerUser);
userRouter.route("/login").get(loginUser);
//secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/admin").post(verifyJWT, createNewAdmin);
userRouter.route("/client").post(verifyJWT, createNewClient);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/user").get(verifyJWT, getCurrentUser,getCurrentUserRole);
userRouter.route("/password").put(verifyJWT, changeCurrentPassword);
userRouter.route("/update").patch(verifyJWT, updateUserDetails);

export default userRouter;
