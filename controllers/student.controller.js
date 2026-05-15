const User = require("../models/user.model");
const Student = require("../models/student.model");
const Parent = require("../models/parent.model");
const Class = require("../models/class.model");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const MailService = require("../services/mail.service");

exports.addStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            father_name,
            father_phone,
            father_email,
            father_create_login,
            mother_name,
            mother_phone,
            mother_email,
            mother_create_login
        } = req.body;

        if (!name || !email) {
            return res.status(400).send("Required fields missing");
        }
        // const existingUser = await User.userDetailsByUsername({ username: username });

        // if (existingUser.length > 0) {
        //     return res.status(400).send("Email already exists");
        // }
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

        const token = crypto.randomBytes(32).toString("hex");
        const expiryDate =
            new Date(
                Date.now() +
                24 * 60 * 60 * 1000
            );
        const mysqlDate = expiryDate.toISOString().slice(0, 19).replace('T', ' ');
        let profileImage = '';
        if (req.file) {
            profileImage = req.file.filename;
        }
        let addUser = await User.insertUser({
            ...req.body,
            username: admissionNo,
            verification_token: token,
            token_expiry: mysqlDate,
            password_setup_required: 1,
            role_id: 3
        });
        const studentId = await Student.insertStudent({
            ...req.body,
            user_id: addUser,
            roll_no: rollNo,
            admission_no: admissionNo
        });
        await MailService.sendSetupMail(
            req.body.email,
            admissionNo,
            token
        );

        if (father_create_login) {
            const parentCode = 'PAR' + Date.now();
            const parentToken = crypto.randomBytes(32).toString("hex");
            const fatherUserId = await User.insertUser({
                username: parentCode,
                name: father_name,
                email: father_email,
                phone: father_phone,
                status: "ACTIVE",
                role_id: 4,
                verification_token: parentToken,
                token_expiry: mysqlDate,
                password_setup_required: 1
            });

            const fatherParentId =
                await Parent.insertParent({
                    user_id: fatherUserId,
                    parent_code: parentCode,
                    occupation: req.body.father_occupation,
                    emergency_contact: father_phone,
                    relation_with_student: "FATHER"
                });
            await Student.linkParent({
                student_id: studentId,
                parent_id: fatherParentId,
                relation: "FATHER"
            });
            await MailService.sendSetupMail(
                father_email,
                parentCode,
                parentToken
            );
        }
        if (mother_create_login) {
            const parentCode = 'PAR' + (Date.now() + 1);
            const parentToken = crypto.randomBytes(32).toString("hex");
            const motherUserId = await User.insertUser({
                username: parentCode,
                name: mother_name,
                email: mother_email,
                phone: mother_phone,
                status: "ACTIVE",
                role_id: 4,
                verification_token: parentToken,
                token_expiry: mysqlDate,
                password_setup_required: 1
            });

            const motherParentId =
                await Parent.insertParent({
                    user_id: motherUserId,
                    parent_code: parentCode,
                    occupation: req.body.mother_occupation,
                    emergency_contact: mother_phone,
                    relation_with_student: "MOTHER"
                });

            await Student.linkParent({
                student_id: studentId,
                parent_id: motherParentId,
                relation: "MOTHER"
            });
            await MailService.sendSetupMail(
                mother_email,
                parentCode,
                parentToken
            );
        }
        res.status(201).json({
            success: true,
            message: "Student added successfully",
            username: admissionNo
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
}

exports.studentDetailsById = async (req, res) => {
    try {
        const rows = await Student.getStudentById(req.query);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "Student not found"
            });
        }

        // Student info (take first row)
        const response = {
            studentId: rows[0].studentId,
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
            attendance: rows.map(r => ({
                date: r.date,
                status: r.attendance_status
            })),
            class_name: rows[0].class_name,
            section_name: rows[0].section_name,
            class_teacher_name: rows[0].class_teacher_name,
            father_name: rows[0].father_name,
            mother_name: rows[0].mother_name

        };



        res.status(200).json(response);


    } catch (err) {
        res.status(500).send("Internal server error");
    }
}

exports.studentListByClassAndSection = async (req, res) => {
    try {
        let student = await Student.getStudentList(req.query);
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