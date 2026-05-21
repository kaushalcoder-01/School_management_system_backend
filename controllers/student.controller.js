const User = require("../models/user.model");
const Student = require("../models/student.model");
const Parent = require("../models/parent.model");
const Class = require("../models/class.model");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const MailService = require("../services/mail.service");
const parentController = require("../controllers/parent.controller");

exports.generateUniqueAdmissionNo = async () => {
  let isExists = true;
  let admissionNo = "";

  while (isExists) {
    const randomNo = Math.floor(1000 + Math.random() * 9000);
    admissionNo = `ADM${randomNo}`;
    const rows = await Student.getNextAdmissionNo({ admissionNo });
    if (!rows.length) {
      isExists = false;
    }
  }

  return admissionNo;
};

exports.addStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      class_id,
      section_id,
      father_parent_id,
      mother_parent_id,
      father_name,
      father_phone,
      father_email,
      father_create_login,
      father_occupation,
      mother_name,
      mother_phone,
      mother_email,
      mother_create_login,
      mother_occupation,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 1. Validate class
    const classData = await Class.getClassById(req.body);
    if (!classData.length) {
      return res.status(400).json({ message: "Class not found" });
    }

    // 2. Validate section
    const sectionData = await Class.getSection(req.body);
    if (!sectionData.length) {
      return res.status(400).json({ message: "Invalid section" });
    }

    // 3. Generate student data
    const nextRoll = await Student.getNextRollNo(req.body);
    const rollNo = nextRoll[0].next_roll_no;

    const admissionNo = await exports.generateUniqueAdmissionNo();

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // 4. Create STUDENT user
    const studentUserId = await User.insertUser({
      username: admissionNo,
      name,
      email,
      phone: req.body.phone,
      gender: req.body.gender,
      date_of_birth: req.body.date_of_birth,
      address: req.body.address,
      profile_image: req.file ? req.file.filename : null,
      status: "ACTIVE",
      role_id: 3,
      verification_token: token,
      token_expiry: expiry,
      password_setup_required: 1,
      is_login_enabled: 1,
    });

    // 5. Create student profile
    const studentId = await Student.insertStudent({
      user_id: studentUserId,
      class_id,
      section_id,
      roll_no: rollNo,
      admission_no: admissionNo,
      admission_date: req.body.admission_date,
      blood_group: req.body.blood_group,
      academic_year: req.body.academic_year,
    });

    await MailService.sendSetupMail(email, admissionNo, token);

    // REUSABLE PARENT FUNCTION
    const createOrGetParent = async (parentData, relation, createLogin) => {
      if (!parentData?.name || !parentData?.phone) {
        console.log("SKIPPED PARENT:", relation);
        return null;
      }

      const searchKey = parentData.phone || parentData.email;
      const existing = await Parent.getParentByPhoneOrEmail({
        search: searchKey,
      });

      if (existing.length > 0) {
        const existingParent = existing[0];
        if (
          existingParent.name.trim().toLowerCase() !==
          parentData.name.trim().toLowerCase()
        ) {
          throw new Error(
            `Phone number already belongs to another parent (${existingParent.name})`,
          );
        }
        return existingParent.id;
      }

      const parentCode = await parentController.generateUniqueParentCode();
      const parentToken = crypto.randomBytes(32).toString("hex");
      const parentUserId = await User.insertUser({
        username: parentCode,
        name: parentData.name,
        email: parentData.email || null,
        phone: parentData.phone,
        gender: relation === "FATHER" ? "Male" : "Female",
        address: req.body.address,
        status: "ACTIVE",
        role_id: 4,
        verification_token: parentToken,
        token_expiry: expiry,
        password_setup_required: 1,
        is_login_enabled: Number(createLogin) === 1,
      });

      if (!parentUserId || typeof parentUserId !== "number") {
        console.log(" INVALID PARENT USER ID:", parentUserId);
        return null;
      }

      const parentId = await Parent.insertParent({
        user_id: parentUserId,
        parent_code: parentCode,
        occupation: parentData.occupation,
        emergency_contact: parentData.phone,
        relation_with_student: relation,
      });

      if (
        (relation === "FATHER" && father_create_login) ||
        (relation === "MOTHER" && mother_create_login)
      ) {
        await MailService.sendSetupMail(
          parentData.email,
          parentCode,
          parentToken,
        );
      }

      return parentId;
    };
    // FATHER
    let fatherParentId = null;

    if (father_parent_id) {
      // EXISTING FATHER
      fatherParentId = father_parent_id;
    } else {
      // CREATE NEW FATHER
      fatherParentId = await createOrGetParent(
        {
          name: father_name,
          phone: father_phone,
          email: father_email,
          occupation: father_occupation,
        },
        "FATHER",
        father_create_login,
      );
    }

    if (fatherParentId) {
      await Student.linkParent({
        student_id: studentId,
        parent_id: fatherParentId,
        relation: "FATHER",
      });
    }
    // MOTHER
    let motherParentId = null;

    if (mother_parent_id) {
      // EXISTING MOTHER
      motherParentId = mother_parent_id;
    } else {
      // CREATE NEW MOTHER
      motherParentId = await createOrGetParent(
        {
          name: mother_name,
          phone: mother_phone,
          email: mother_email,
          occupation: mother_occupation,
        },
        "MOTHER",
        mother_create_login,
      );
    }

    if (motherParentId) {
      await Student.linkParent({
        student_id: studentId,
        parent_id: motherParentId,
        relation: "MOTHER",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Student added successfully",
      admission_no: admissionNo,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
    });
  }
};

exports.editStudent = async (req, res) => {
  try {
    const studentData = await Student.getStudentById({
      student_id: req.params.id,
    });

    if (!studentData.length) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const student = studentData[0];

    // ✅ UPDATE USER TABLE
    await User.updateUser({
      ...req.body,
      user_id: student.userId,
    });

    // ✅ UPDATE STUDENT TABLE (IMPORTANT FIX)
    await Student.updateStudent({
      ...req.body,
      student_id: student.studentId,
    });

    // FATHER
    const father = await Parent.getStudentParent({
      student_id: student.studentId,
      relation: "FATHER",
    });

    if (father.length) {
      const fatherData = father[0];

      await Parent.updateParent({
        parent_id: fatherData.parent_id,
        occupation: req.body.father_occupation,
        emergency_contact: req.body.father_phone,
      });

      if (fatherData.user_id) {
        await User.updateParentUser({
          user_id: fatherData.user_id,
          name: req.body.father_name,
          email: req.body.father_email,
          phone: req.body.father_phone,
          address: req.body.address,
        });
      }
    }

    // MOTHER
    const mother = await Parent.getStudentParent({
      student_id: student.studentId,
      relation: "MOTHER",
    });

    if (mother.length) {
      const motherData = mother[0];

      await Parent.updateParent({
        parent_id: motherData.parent_id,
        occupation: req.body.mother_occupation,
        emergency_contact: req.body.mother_phone,
      });

      if (motherData.user_id) {
        await User.updateParentUser({
          user_id: motherData.user_id,
          name: req.body.mother_name,
          email: req.body.mother_email,
          phone: req.body.mother_phone,
          address: req.body.address,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || "Internal server error",
    });
  }
};

exports.studentDetailsById = async (req, res) => {
  try {

    const rows = await Student.getStudentById(req.query);
    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // GET SIBLINGS
    const siblings = await Student.getStudentSiblings({
      student_id: rows[0].studentId,
    });

    const response = {

      student_id: rows[0].studentId,

      userId: rows[0].userId,

      name: rows[0].name,
      email: rows[0].email,
      phone: rows[0].phone,
      gender: rows[0].gender,

      date_of_birth: rows[0].date_of_birth,
      address: rows[0].address,

      profile_image: rows[0].profile_image,
      status: rows[0].status,

      admission_no: rows[0].admission_no,
      roll_no: rows[0].roll_no,

      admission_date: rows[0].admission_date,
      blood_group: rows[0].blood_group,
      academic_year: rows[0].academic_year,

      attendance: rows.map((r) => ({
        date: r.date,
        status: r.attendance_status,
      })),

      class_name: rows[0].class_name,
      section_name: rows[0].section_name,
      class_teacher_name: rows[0].class_teacher_name,

      father_name: rows[0].father_name,
      father_phone: rows[0].father_phone,
      father_email: rows[0].father_email,
      father_occupation: rows[0].father_occupation,
      father_login_access: Boolean(rows[0].login_access),

      mother_name: rows[0].mother_name,
      mother_phone: rows[0].mother_phone,
      mother_email: rows[0].mother_email,
      mother_occupation: rows[0].mother_occupation,
      mother_login_access: Boolean(rows[0].login_access),

      class_id: rows[0].class_id,
      section_id: rows[0].section_id,

      siblings,
    };

    return res.status(200).json({
      success: true,
      data: response,
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Internal server error",
    });
  }
};

exports.studentListByClassAndSection = async (req, res) => {
  try {
    let student = await Student.getStudentList(req.query);
    res.status(200).send(student);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const attendanceData = req.body.attendance;
    for (let item of attendanceData) {
      await Student.markAttendance({
        student_id: item.student_id,
        date: req.body.attendance_date,
        status: item.status,
        marked_by: req.body.marked_by,
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (err) {
    console.log(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date",
      });
    }

    res.status(500).send("Internal server error");
  }
};

exports.studentAttendanceList = async (req, res) => {
  try {
    let student = await Student.getAttendanceList(req.body);
    res.status(200).send({
      success: true,
      data: student,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.getStudentAttendanceById = async (req, res) => {
  try {
    let attendance = await Student.getAttendanceById(req.body);
    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};
