const User = require("../models/user.model");
const Dashboard = require("../models/Dashboard.model");
const config = require("../config/config");

exports.getDashboardSummary = async (req, res) => {
  try {
    const data = await Dashboard.getSummary();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getActivityLog = async (req, res) => {
  try {
    let log = await Dashboard.getLog();

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
