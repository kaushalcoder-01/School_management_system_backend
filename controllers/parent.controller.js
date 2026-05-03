const User = require("../models/user.model");
const Parent = require("../models/parent.model");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.addParent = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password ) {
            return res.status(400).send("Required fields missing");
        }
        const existingUser = await User.userDetailsByEmail({ email });

        if (existingUser.length > 0) {
            return res.status(400).send("Email already exists");
        }
        let salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
        let addUser = await User.insertUser({
            ...req.body,
            role_id: 4
        });
        await Parent.insertParent({
            ...req.body,
            user_id: addUser
        });
        res.status(201).json({
            success: true,
            message: "Parent added successfully",
            user_id: addUser
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
}