const User = require("../models/user.model");
const Student = require("../models/student.model");
const Class = require("../models/class.model");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.addStudent = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send("Required fields missing");
        }
        const existingUser = await User.userDetailsByEmail({ email });

        if (existingUser.length > 0) {
            return res.status(400).send("Email already exists");
        }
        // Check class exists
        const classData = await Class.getClassById(req.body);


        if (!classData.length) {
            return res.status(400).json({
                success: false,
                message: "Class not found"
            });
        }

        const sectionData = await Class.getSection(req.body);

        if (!sectionData.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid section for class"
            });
        }
        let salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        let addUser = await User.insertUser({
            ...req.body,
            role_id: 3
        });
        await Student.insertStudent({
            ...req.body,
            user_id: addUser,
      });
        res.status(201).json({
            success: true,
            message: "Student added successfully",
            user_id: addUser
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
}