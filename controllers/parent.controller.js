const User = require("../models/user.model");
const Parent = require("../models/parent.model");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// exports.addParent = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).send("Required fields missing");
//     }
//     const existingUser = await User.userDetailsByEmail({ email });

//     if (existingUser.length > 0) {
//       return res.status(400).send("Email already exists");
//     }
//     let salt = await bcrypt.genSalt(10);
//     req.body.password = await bcrypt.hash(req.body.password, salt);
//     let addUser = await User.insertUser({
//       ...req.body,
//       role_id: 4,
//     });
//     await Parent.insertParent({
//       ...req.body,
//       user_id: addUser,
//     });
//     res.status(201).json({
//       success: true,
//       message: "Parent added successfully",
//       user_id: addUser,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Internal server error");
//   }
// };

exports.editParent = async (req, res) => {
  try {
    const parentData = await Parent.getParentById({
      parent_id: req.params.id,
    });

    if (!parentData.length) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }
    const parent = parentData[0];

    // PROFILE IMAGE

    let profileImage = parent.profile_image;
    if (req.file) {
      profileImage = req.file.filename;
    }

    // UPDATE USER TABLE

    await User.updateParentUser({
      user_id: parent.user_id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      date_of_birth: req.body.date_of_birth,
      gender: req.body.gender,
      profile_image: profileImage,
    });

    // UPDATE PARENT TABLE

    await Parent.updateParent({
      parent_id: parent.parent_id,
      occupation: req.body.occupation,
      emergency_contact: req.body.emergency_contact,
      status: req.body.status,
    });

    return res.status(200).json({
      success: true,
      message: "Parent updated successfully",
      data: parent
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || "Internal server error",
    });
  }
};

exports.searchParent = async (req, res) => {
  try {
    const rows = await Parent.getParentByPhoneOrEmail(req.body);
    res.status(200).json({
      success: true,
      data: rows.length ? rows[0] : null,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
};

exports.generateUniqueParentCode = async (req, res) => {
  let isExists = true;
  let parentCode = "";

  while (isExists) {
    const randomNo = Math.floor(1000 + Math.random() * 9000);
    parentCode = `PAR${randomNo}`;
    const rows = await Parent.checkParentCodeExists({ parentCode: parentCode });
    if (!rows.length) {
      isExists = false;
    }
  }

  return parentCode;
};

exports.parentList = async (req, res) => {
  try {
    const rows = await Parent.getParentList();
    let parents = [];
    rows.forEach((item) => {
      let existingParent = parents.find((p) => p.parent_id === item.parent_id);

      if (!existingParent) {
        existingParent = {
          parent_id: item.parent_id,
          user_id: item.user_id,
          parent_name: item.parent_name,
          parent_email: item.parent_email,
          parent_phone: item.parent_phone,
          parent_status: item.parent_status,
          parent_profile_image: item.parent_profile_image,
          address: item.address,
          occupation: item.occupation,
          relation_with_student: item.relation_with_student,
          login_access: Boolean(item.login_access),
          children: [],
        };
        parents.push(existingParent);
      }

      if (item.student_id) {
        existingParent.children.push({
          student_id: item.student_id,
          student_name: item.student_name,
          student_email: item.student_email,
          gender: item.gender,
          admission_no: item.admission_no,
          roll_no: item.roll_no,
          class_name: item.class_name,
          section_name: item.section_name,
          relation: item.relation,
          class_id: item.class_id,
          section_id: item.section_id,
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: parents,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message,
    });
  }
};

exports.parentDetailsById = async (req, res) => {
  try {
    const rows = await Parent.getParentById({
      parent_id: req.query.parent_id,
    });

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    const parent = {
      parent_id: rows[0].parent_id,
      user_id: rows[0].user_id,

      parent_name: rows[0].parent_name,
      parent_email: rows[0].parent_email,
      parent_phone: rows[0].parent_phone,
      parent_gender: rows[0].parent_gender,
      address: rows[0].address,
      occupation: rows[0].occupation,
      relation_with_student: rows[0].relation_with_student,
      parent_profile_image: rows[0].parent_profile_image,
      parent_status: rows[0].parent_status,
      parent_code: rows[0].parent_code,

      children: rows.map((item) => ({
        student_id: item.student_id,
        student_name: item.student_name,
        student_email: item.student_email,
        student_profile_image: item.profile_image,
        gender: item.gender,
        admission_no: item.admission_no,
        roll_no: item.roll_no,
        class_id: item.class_id,
        section_id: item.section_id,
        class_name: item.class_name,
        section_name: item.section_name,
        relation: item.relation,
        status: item.status,
      })),
    };

    return res.status(200).json({
      success: true,
      data: parent,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.sqlMessage || err.message || "Internal server error",
    });
  }
};
