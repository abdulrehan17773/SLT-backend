import { asyncHandler } from "../utils/asyncHandler.js";
import  { User }  from "../models/user.models.js";
import  { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const checkLogin = asyncHandler( async(req, _, next) => {

    // get token
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    if(token){
        throw new ApiError(401, "User already logged in");
    }

    next();
});

const checkAuth = asyncHandler( async(req, _, next) => {

    // get token
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token){
        throw new ApiError(401, "Unauthorized token");
    }

    // decode the token
    const {_id} = jwt.verify(token, process.env.ACCESS_TOKEN_STRING)
    // get user
    const user = await User.findOne({_id}).select("-password -refreshToken -__v -createdAt -updatedAt -deletedAt ");

    if(!user){
        throw new ApiError(401, "Unauthorized");
    }

    // set user for next
    req.user = user;
    next();
});

const checkAdmin = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized token");
    }

    // decode the token
    const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_STRING);

    // get user and check if 'Admin' is in role array
    const user = await User.findById(_id).select("-password -refreshToken -__v -createdAt -updatedAt -deletedAt");

    if (!user || !user.role.includes("Admin")) {
        throw new ApiError(403, "Forbidden: Admins only");
    }

    // set user for next
    req.user = user;
    next();
});




export { checkAuth, checkAdmin, checkLogin };