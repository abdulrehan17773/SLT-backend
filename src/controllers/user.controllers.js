import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const options = {
    httpOnly: true,
    secure: true
};

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        if (!accessToken || !refreshToken) {
            throw new ApiError(500, "Failed to generate tokens");
        }

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;

    if ([fullname, email, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const userExists = await User.findOne({ email: email.toLowerCase(), deletedAt: null  });
    if (userExists) {
        res.status(409);
        throw new ApiError(409, "User already exists");
    }

    const createUser = await User.create({
        fullname,
        email: email.toLowerCase(),
        password
    });

    const userCreated = await User.findById(createUser._id)
        .select("-password -refreshToken -__v -createdAt -updatedAt -deletedAt");

    if (!userCreated) {
        res.status(500);
        throw new ApiError(500, "User creation failed");
    }

    return res.status(200).json(
        new ApiResponse(201, userCreated, "User created successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new ApiError(400, "Email and password are required");
    }

    const userExists = await User.findOne({ email: email.toLowerCase(), deletedAt: null  });
    if (!userExists) {
        res.status(404);
        throw new ApiError(404, "User not found");
    }

    const passwordMatched = await userExists.comparePassword(password);
    if (!passwordMatched) {
        res.status(401);
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateTokens(userExists._id);

    const loginUser = await User.findById(userExists._id)
        .select("-password -refreshToken -__v -createdAt -updatedAt -deletedAt");

    if (!loginUser) {
        res.status(500);
        throw new ApiError(500, "Server error");
    }

    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, { user: loginUser, accessToken, refreshToken }, "User logged in successfully")
        );
});

const logout = asyncHandler(async (req, res) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: null } },
        { new: true }
    );

    if (!updatedUser) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    res.status(200)
        .clearCookie("refreshToken", null, options)
        .clearCookie("accessToken", null, options)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const tokenUpdate = asyncHandler(async (req, res) => {
    const oldrefreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!oldrefreshToken) {
        res.status(401);
        throw new ApiError(401, "Unauthorized Token");
    }

    const { _id } = jwt.verify(oldrefreshToken, process.env.REFRESH_TOKEN_STRING);
    const user = await User.findById(_id);

    if (!user) {
        res.status(404);
        throw new ApiError(404, "User not found");
    }

    if (user.refreshToken !== oldrefreshToken) {
        res.status(401);
        throw new ApiError(401, "Unauthorized Token");
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { accessToken, refreshToken }, "Token updated successfully")
        );
});

const currentUser = asyncHandler(async (req, res) => {
    const user = req.user;
    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
});

const updateProfile = asyncHandler(async (req, res) => {
    const { fullname, password } = req.body;
    const user = req.user;

    if (!fullname && !password) {
        throw new ApiError(400, "Please provide fullname or password to update");
    }

    let isUpdated = false;

    // Update fullname if provided and different
    if (fullname && fullname !== user.fullname) {
        user.fullname = fullname;
        isUpdated = true;
    }

    // Update password if provided
    if (password) {
        user.password = password;
        isUpdated = true;
    }

    if (!isUpdated) {
        throw new ApiError(400, "No changes detected");
    }

    await user.save(); // do NOT skip validation here so password hashing works

    const updatedUser = await User.findById(user._id).select(
        "-password -refreshToken -__v -createdAt -updatedAt -deletedAt"
    );

    return res.status(200).json(
        new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
});


export { registerUser, loginUser, logout, tokenUpdate, currentUser, updateProfile };
