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
        const nextRoll = await Student.getNextRollNo(req.body);
        const rollNo = nextRoll[0].next_roll_no;

        const nextAdmission = await Student.getNextAdmissionNo();
        const admissionNo = 'ADM' + String(nextAdmission[0].next_id).padStart(4, '0');

        let salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        let addUser = await User.insertUser({
            ...req.body,
            role_id: 3
        });
        await Student.insertStudent({
            ...req.body,
            user_id: addUser,
            roll_no: rollNo,
            admission_no: admissionNo
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

exports.studentDetailsById = async (req, res) => {
    try {
        const rows = await Student.getStudentById(req.body);

         if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Student info (take first row)
        const response = {
            student_id: rows[0].student_id,
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

            class_name: rows[0].class_name,
            section_name: rows[0].section_name,
            class_teacher_name: rows[0].class_teacher_name,
            parents: []
        };

        // Parents array
        rows.forEach(r => {
            if (r.parent_name) {
                response.parents.push({
                    name: r.parent_name,
                    relation: r.parent_relation
                });
            }
        });

        res.status(200).json(response);


    } catch (err) {
        res.status(500).send("Internal server error");
    }
}

exports.studentListByClassAndSection = async (req, res) => {
    try {
        let student = await Student.getStudentList(req.body);
        res.status(200).send(student);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
}

exports.markAttendance = async (req, res) => {

    try {

        const attendanceData = req.body.attendance;
        for (let item of attendanceData) {

            await Student.markAttendance({
                student_id: item.student_id,
                date: req.body.attendance_date,
                status: item.status,
                marked_by: req.body.marked_by
            });
        }

        res.status(200).json({
            success: true,
            message: "Attendance marked successfully"
        });

    } catch (err) {

        console.log(err);
        if (err.code === 'ER_DUP_ENTRY') {

            return res.status(400).json({
                success: false,
                message: "Attendance already marked for this date"
            });
        }

        res.status(500).send(
            "Internal server error"
        );
    }
};

exports.studentAttendanceList = async (req, res) => {
    try {
        let student = await Student.getAttendanceList(req.body);
        res.status(200).send({
            success: true,
            data: student
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
}

exports.getStudentAttendanceById = async (req, res) => {

    try {
        let attendance = await Student.getAttendanceById(req.body);
        res.status(200).json({
            success: true,
            data: attendance
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
};