import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// 1. Add New User
const addUser = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;

    if ([fullname, email, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const newUser = await User.create({
        fullname,
        email: email.toLowerCase(),
        password,
    });

    const userResponse = await User.findById(newUser._id).select("-password -refreshToken -__v -deletedAt");
    return res.status(201).json(new ApiResponse(201, userResponse, "User created successfully"));
});

// 2. Get All Users (excluding soft-deleted)
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ deletedAt: null }).select("-password -refreshToken -__v -deletedAt");
    return res.status(200).json(new ApiResponse(200, users, "All users fetched successfully"));
});

// 3. Update User (only fullname and password)
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullname, password } = req.body;

    const user = await User.findById(id);
    if (!user || user.deletedAt) {
        throw new ApiError(404, "User not found");
    }

    if (fullname) user.fullname = fullname;
    if (password) user.password = password; // will be hashed in pre-save hook

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password -refreshToken -__v -deletedAt");
    return res.status(200).json(new ApiResponse(200, updatedUser, "User updated successfully"));
});


// 4. Soft Delete User (by ID)
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.deletedAt) {
        throw new ApiError(404, "User not found or already deleted");
    }

    user.deletedAt = new Date();
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

export { addUser, getAllUsers, updateUser, deleteUser };
