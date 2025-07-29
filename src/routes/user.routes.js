import { Router } from "express";
import { registerUser, loginUser, logout, tokenUpdate, currentUser, updateProfile, checkTokens, addFeedback } from "../controllers/user.controllers.js";
import {checkLogin, checkAuth} from "../middlewares/checkAuth.middleware.js"
import checkFeedbackToday from "../middlewares/feedback.middleware.js";

const UserRouter = Router();

// // unsecure routes
UserRouter.route("/register").post(registerUser);
UserRouter.route("/login").post(checkLogin, loginUser);
UserRouter.route("/refresh-token").post(tokenUpdate);
UserRouter.route("/checkTokens").get(checkTokens);
UserRouter.use(checkAuth);
UserRouter.route("/logout").post(logout);
UserRouter.route("/current-user").get(currentUser);
UserRouter.route("/update-profile").put(updateProfile);
UserRouter.route("/feedback").post(checkFeedbackToday, addFeedback);

export { UserRouter };  
