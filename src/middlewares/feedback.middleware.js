import Feedback from '../models/feedback.models.js'; 

const checkFeedbackToday = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const existingFeedback = await Feedback.findOne({
      user: userId,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existingFeedback) {
      return res.status(400).json({
        message: "You have already submitted feedback today.",
      });
    }

    next();
  } catch (error) {
    console.error('Feedback check error:', error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export default checkFeedbackToday;
