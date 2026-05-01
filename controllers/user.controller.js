const User   = require("../models/user.model");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        // Check user exist
        const userDetails = await User.userDetailsByEmail(req.body);
        const rememberMe = 1; 

        const tokenExpiry = rememberMe ? config.REMTOKEN_EXPIRY : config.TOKEN_EXPIRY;
        
        if(userDetails.length > 0) {
            const validPass = await bcrypt.compare(req.body.password, userDetails[0]['password']);
            console.log(validPass);
            if (!validPass) return res.status(400).send("Your password does not match");
            // Create and assign token
            const token     = jwt.sign({ id: userDetails[0]['user_id'], role: userDetails[0]['role'] }, config.TOKEN_SECRET, { expiresIn: tokenExpiry });
            delete userDetails[0]['password'];
			req.userid      = userDetails[0]['user_id'];
            res.header("auth-token", token).send({
                token             : token,
                name              : userDetails[0]['name'],
				email             : userDetails[0]['email'],
				role              : userDetails[0]['role'],
				profile_image     : userDetails[0]['profile_image'],
                // loginStatus       : userDetails[0]['loginStatus'],
                expTime           : tokenExpiry,
            }); 
        }
        else {
            res.status(400).send("User does not exists");
        }
    }
    catch (err) {
		console.log(err);
        res.status(500).send("Internal server error");
    }
};

exports.addUser = async (req, res) => {
    try {
		
            let salt          = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
			//req.body.role_id  = config.USER_ROLE_ID;
            let addUser       = await User.insertUser(req.body);
            res.status(200).json({ res: addUser });
	
   } catch (err) {
	   console.log(err);
       res.status(500).send("Internal server error");
    }
}