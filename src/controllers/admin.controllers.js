import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import  Feedback  from "../models/feedback.models.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// 1. Add New User
const addUser = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;

    if ([fullname, email, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

  const existingUser = await User.findOne({ email: email.toLowerCase(), deletedAt: null });

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
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  // Prepare query filter
  const filter = {
    deletedAt: null,
    role: { $ne: "Admin" }
  };

  // Count total non-admin users
  const total = await User.countDocuments(filter);

  // Fetch non-admin users
  const users = await User.find(filter)
    .select("-password -refreshToken -__v -deletedAt")
    .skip(skip)
    .limit(limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "All users fetched successfully"
    )
  );
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

  return res.status(200).json(
    new ApiResponse(200, null, "User deleted successfully")
  );
});


// 5. Admin Dashboard: Counts (total, today, soft-deleted)
const getUserCounts = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalUsers = await User.countDocuments({ deletedAt: null, role: { $ne: "Admin" } });

    const feedbacks = await Feedback.find({}, "stars");
    const totalFeedbacks = feedbacks.length;
    const totalStars = feedbacks.reduce((sum, f) => sum + f.stars, 0);
    const todaysUsers = totalFeedbacks > 0
        ? Math.round((totalStars / totalFeedbacks) * 10) / 10
        : 0;

    const softDeletedUsers = await User.countDocuments({ deletedAt: { $ne: null } });

    return res.status(200).json(new ApiResponse(200, {
        totalUsers,
        todaysUsers, // averageRating with 1 decimal place (e.g. 3.5)
        softDeletedUsers
    }, "Dashboard counts fetched"));
});

// 6. Admin Dashboard: Last 5 Users
const getRecentUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ deletedAt: null, role: { $ne: "Admin" } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("fullname email createdAt");

    return res.status(200).json(new ApiResponse(200, users, "Recent users fetched"));
});

// 7. Admin Dashboard: Users in last 7 days (daily count)
const getLast7DaysUsers = asyncHandler(async (req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // includes today

    const stats = await User.aggregate([
        { $match: { deletedAt: null, createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return res.status(200).json(new ApiResponse(200, stats, "Last 7 days user stats"));
});

// 8. Admin Dashboard: Users in last 4 weeks (weekly count)
const getLast4WeeksUsers = asyncHandler(async (req, res) => {
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27); // 4 weeks * 7 days - includes today

    const stats = await User.aggregate([
        { $match: { deletedAt: null, createdAt: { $gte: fourWeeksAgo } } },
        {
            $group: {
                _id: {
                    $isoWeek: "$createdAt"
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return res.status(200).json(new ApiResponse(200, stats, "Last 4 weeks user stats"));
});

// 9. Get All Feedbacks (for admin)
const getAllFeedbacks = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  const total = await Feedback.countDocuments();

  const feedbacks = await Feedback.find()
    .populate("user", "fullname email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json(
    new ApiResponse(200, {
      feedbacks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }, "All feedbacks fetched")
  );
});


export {
  addUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserCounts,
  getRecentUsers,
  getLast7DaysUsers,
  getLast4WeeksUsers,
  getAllFeedbacks
};
