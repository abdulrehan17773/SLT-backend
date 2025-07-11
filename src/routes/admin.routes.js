import { Router } from "express";
import { addUser, getAllUsers, updateUser, deleteUser } from "../controllers/admin.controllers.js";
import {checkAdmin} from "../middlewares/checkAuth.middleware.js"

const UserRouter = Router();

// // unsecure routes
UserRouter.use(checkAdmin);
UserRouter.route("/addUser").post(addUser);
UserRouter.route("/getAllUsers").get(getAllUsers);
UserRouter.route("/updateUser").patch(updateUser);
UserRouter.route("/deleteUser").patch(deleteUser);

export { UserRouter };  
