const User = require("../models/user.model");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// async function run() {
//   const hash = await bcrypt.hash("admin@123", 10);
//   console.log(hash);
// }

// run();

exports.login = async (req, res) => {
    try {
        // Check user exist
        const userDetails = await User.userDetailsByLogin(req.body);
        if (!userDetails.length) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        if (!userDetails[0].is_verified) {
            return res.status(400).json({
                success: false,
                message: "Please setup password first"
            });
        }
        //const rememberMe = 1;
        const validPass = await bcrypt.compare(req.body.password, userDetails[0].password);
        if (!validPass) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign({
            id: userDetails[0].user_id,
            role: userDetails[0].role
        }, config.TOKEN_SECRET,
            {
                expiresIn: "7d"
            });

        res.status(200).json({

            success: true,
            token,
            user: {
                id: userDetails[0].user_id,
                username: userDetails[0].username,
                name: userDetails[0].name,
                email: userDetails[0].email,
                role: userDetails[0].role,
                profile_image: userDetails[0].profile_image
            }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
};

exports.setupPassword = async (req, res) => {

    try {

        const user = await User.getUserByToken(req.body.token);

        if (!user.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        let salt = await bcrypt.genSalt(10);

        let password =  await bcrypt.hash(req.body.password, salt);

        await User.updatePassword({
            password,
            token: req.body.token
        });

        res.status(200).json({
            success: true,
            message: "Password setup successful"
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(
            "Internal server error"
        );
    }
};

exports.addUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
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
            role_id: 1
        });
        res.status(201).json({
            success: true,
            message: "Admin added successfully",
            user_id: addUser
        });

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
}


