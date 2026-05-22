const User = require("../models/user.model");
const Teacher = require("../models/teacher.model");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.generateUniqueEmployeeCode = async () => {
  let isExists = true;
  let employeeCode = "";

  while (isExists) {
    const randomNo = Math.floor(1000 + Math.random() * 9000);
    employeeCode = `EMP${randomNo}`;
    const rows = await Teacher.getNextEmployeeCode({ employeeCode });
    if (!rows.length) {
      isExists = false;
    }
  }

  return employeeCode;
};

exports.addTeacher = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const employeeCode = await exports.generateUniqueEmployeeCode();

    let profileImage = "";
    if (req.file) {
      profileImage = req.file.filename;
    }

    // INSERT USER

    const userId = await User.insertUser({
      ...req.body,
      username: email,
      profile_image: profileImage,
      role_id: 2,
      is_login_enabled: 0,
      status: req.body.status || "ACTIVE",
    });

    // INSERT TEACHER

    const teacherId = await Teacher.insertTeacher({
      ...req.body,
      user_id: userId,
      employee_code: employeeCode,
    });

    // SUBJECT ASSIGNMENTS

    let assignments = req.body.assignments || [];
    if (typeof assignments === "string") {
      assignments = JSON.parse(assignments);
    }

    for (const item of assignments) {
      await Teacher.addTeacherSubject({
        teacher_id: teacherId,
        subject_id: item.subject_id,
        class_id: item.class_id,
        section_id: item.section_id,
      });
    }

    // CLASS TEACHER VALIDATION
    console.log(req.body.class_teacher_section_id);
    let classTeacherMessage = "";
    if (
      req.body.class_teacher_section_id &&
      req.body.class_teacher_section_id !== "null"
    ) {
      const sectionData = await Teacher.getSectionClassTeacher({
        section_id: req.body.class_teacher_section_id,
      });

      // IF ALREADY ASSIGNED
      const section = sectionData[0];
      if (section.class_teacher_id) {
        classTeacherMessage =
          `${section.class_name} - ${section.section_name} already had ` +
          `${section.teacher_name} as class teacher. ` +
          `Now changed to ${req.body.name}.`;
      } else {
        classTeacherMessage =
          `${req.body.name} is now assigned as class teacher of ` +
          `${section.class_name} - ${section.section_name}.`;
      }

      // UPDATE CLASS TEACHER

      await Teacher.assignClassTeacher({
        teacher_id: teacherId,
        section_id: req.body.class_teacher_section_id,
      });
    }
console.log("CLASS TEACHER MESSAGE", classTeacherMessage);
    return res.status(201).json({
      success: true,
      message: "Teacher added successfully",
      class_teacher_message: classTeacherMessage,
      teacher_id: teacherId,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
    });
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
        message: "teacher_id is required",
      });
    }

    // TEACHER DETAILS
    const teacher = await Teacher.getTeacherById({
      teacher_id: teacherId,
    });

    if (!teacher || teacher.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // SUBJECT ASSIGNMENTS
    const assignments = await Teacher.getTeacherAssignments({
      teacher_id: teacherId,
    });

    // CLASS TEACHER DETAILS
    const classTeacherOf = await Teacher.getClassTeacherOf({
      teacher_id: teacherId,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...teacher[0],
        assignments: assignments || [],
        class_teacher_of: classTeacherOf || [],
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Internal server error",
    });
  }
};
