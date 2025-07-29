import { Router } from "express";
import { addUser, getAllUsers, updateUser, deleteUser, getUserCounts, getRecentUsers, getLast7DaysUsers, getLast4WeeksUsers, getAllFeedbacks } from "../controllers/admin.controllers.js";
import {checkAdmin} from "../middlewares/checkAuth.middleware.js"

const AdminRouter = Router();

// // unsecure routes
AdminRouter.use(checkAdmin);
AdminRouter.route("/addUser").post(addUser);
AdminRouter.route("/getAllUsers").get(getAllUsers);
AdminRouter.route("/updateUser/:id").patch(updateUser);
AdminRouter.route("/deleteUser/:id").patch(deleteUser);
AdminRouter.route("/getUserCounts").get(getUserCounts);
AdminRouter.route("/getRecentUsers").get(getRecentUsers);
AdminRouter.route("/getLast7DaysUsers").get(getLast7DaysUsers);
AdminRouter.route("/getLast4WeeksUsers").get(getLast4WeeksUsers);
AdminRouter.route("/getAllFeedbacks").get(getAllFeedbacks);

export { AdminRouter };  
