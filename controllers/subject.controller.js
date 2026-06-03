const User = require("../models/user.model");
const Subject = require("../models/subject.model");
const config = require("../config/config");
const Dashboard = require("../models/Dashboard.model");

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

exports.generateSubjectCode = (subjectName) => {
  const words = subjectName.trim().split(" ");

  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase();
  }

  return words
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

exports.generateUniqueSubjectCode = async (subjectName) => {
  const baseCode = exports.generateSubjectCode(subjectName);

  const rows = await Subject.checkSubjectCode(baseCode);

  if (rows.length) {
    return null;
  }

  return baseCode;
};

exports.saveSubject = async (req, res) => {
  try {
    const { id, name, is_active = 1 } = req.body;

    // if (!name) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Subject name is required",
    //   });
    // }
    let subjectId;

    if (id) {
      await Subject.updateSubject(req.body);
      subjectId = id;
      await Dashboard.addLog({
        activity_type: "SUBJECT",
        title: "Subject Updated",
        description: `${name} subject updated`,
        created_by: req.user.id,
      });
    } else {
      const subjectCode = await exports.generateUniqueSubjectCode(name);
      if (!subjectCode) {
        return res.status(400).json({
          success: false,
          message:
            "Subject already exists. Please use a different subject name.",
        });
      }
      subjectId = await Subject.addSubject({
        ...req.body,
        subject_code: subjectCode,
      });
      await Dashboard.addLog({
        activity_type: "SUBJECT",
        title: "Subject Added",
        description: `${name} subject added`,
        created_by: req.user.id,
      });
    }
    return res.status(200).json({
      success: true,
      subjectId,
      message: id
        ? "Subject updated successfully"
        : "Subject created successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
    });
  }
};
