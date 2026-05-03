const User = require("../models/user.model");
const Class = require("../models/class.model");
const config = require("../config/config");


exports.classById = async (req, res) => {
    try {
        let classbyid = await Class.getClassById(req.body);
        res.status(200).send(classbyid);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
}