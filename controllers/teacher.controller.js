const User = require("../models/user.model");
const Teacher = require("../models/teacher.model");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.addTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send("Required fields missing");
    }
    const existingUser = await User.userDetailsByEmail({ email });

    if (existingUser.length > 0) {
      return res.status(400).send("Email already exists");
    }
    const nextEmployee = await Teacher.getNextEmployeeCode();
    const employeeCode =
      "EMP" + String(nextEmployee[0].next_id).padStart(4, "0");

    let salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    let addUser = await User.insertUser({
      ...req.body,
      role_id: 2,
    });
    await Teacher.insertTeacher({
      ...req.body,
      user_id: addUser,
      employee_code: employeeCode,
    });
    res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      user_id: addUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.teacherListByClassAndSection = async (req, res) => {
  try {
    let classbyid = await Teacher.getTeacherList(req.body);
    console.log(classbyid);
    res.status(200).send(classbyid);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.getClassList = async (req, res) => {
  try {
    let classList = await Teacher.getClassList();

    res.status(200).json({
      success: true,
      data: classList,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.getSectionList = async (req, res) => {
  try {
    let sectionList = await Teacher.getSectionList(req.body);
    res.status(200).json({
      success: true,
      data: sectionList,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.getTeacherDetails = async (req, res) => {
  try {

    const teacherId = req.query.teacher_id;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: "teacher_id is required"
      });
    }

    // TEACHER DETAILS
    const teacher = await Teacher.getTeacherById({
      teacher_id: teacherId
    });

    if (!teacher || teacher.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // SUBJECT ASSIGNMENTS
    const assignments = await Teacher.getTeacherAssignments({
      teacher_id: teacherId
    });

    // CLASS TEACHER DETAILS
    const classTeacherOf = await Teacher.getClassTeacherOf({
      teacher_id: teacherId
    });

    return res.status(200).json({
      success: true,
      data: {
        ...teacher[0],
        assignments: assignments || [],
        class_teacher_of: classTeacherOf || []
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Internal server error"
    });
  }
};
