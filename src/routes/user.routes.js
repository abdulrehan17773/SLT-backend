import { Router } from "express";
import { registerUser, loginUser, loginRider, loginAdmin, logout, tokenUpdate, currentUser, updateProfile } from "../controllers/user.controllers.js";
import {checkLogin, checkAuth} from "../middlewares/checkAuth.middleware.js"

const UserRouter = Router();

// // unsecure routes
UserRouter.route("/register").post(registerUser);
UserRouter.route("/login").post(checkLogin, loginUser);
UserRouter.route("/refresh-token").post(tokenUpdate);
UserRouter.use(checkAuth);
UserRouter.route("/logout").post(logout);
UserRouter.route("/current-user").get(currentUser);
UserRouter.route("/update-profile").patch(updateProfile);

export { UserRouter };  
