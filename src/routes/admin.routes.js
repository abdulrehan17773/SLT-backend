import { Router } from "express";
import { addUser, getAllUsers, updateUser, deleteUser, getUserCounts, getRecentUsers, getLast7DaysUsers, getLast4WeeksUsers } from "../controllers/admin.controllers.js";
import {checkAdmin} from "../middlewares/checkAuth.middleware.js"

const UserRouter = Router();

// // unsecure routes
UserRouter.use(checkAdmin);
UserRouter.route("/addUser").post(addUser);
UserRouter.route("/getAllUsers").get(getAllUsers);
UserRouter.route("/updateUser").patch(updateUser);
UserRouter.route("/deleteUser").patch(deleteUser);
UserRouter.route("/getUserCounts").get(getUserCounts);
UserRouter.route("/getRecentUsers").get(getRecentUsers);
UserRouter.route("/getLast7DaysUsers").get(getLast7DaysUsers);
UserRouter.route("/getLast4WeeksUsers").get(getLast4WeeksUsers);

export { UserRouter };  
