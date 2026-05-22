const User = require("../models/user.model");
const Subject = require("../models/subject.model");
const config = require("../config/config");

exports.getSubjectList = async (req, res) => {
  try {
    let subjectList = await Subject.getSubjectList();

    res.status(200).json({
      success: true,
      data: subjectList,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};