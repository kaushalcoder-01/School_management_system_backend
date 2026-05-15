const sql = require("../helpers/db.helper.js");

const User = function () {
    if (typeof user.user_id != 'undefined') {
        this.user_id = user.user_id;
    }
    this.name = user.name;
    this.email = user.email;
    this.password = user.password;
    this.profile_image = user.profile_image;
    //this.status        = user.status;
};


User.userDetailsByLogin  = async (req) => {
    let sqlQuery = "SELECT ut.id AS user_id, ut.username, ut.name, ut.email, ut.password, ut.profile_image,  ut.is_verified, rt.name AS role FROM users ut INNER JOIN roles rt on ut.role_id = rt.id WHERE ut.email = '" + req.identifier + "' OR ut.username = '" + req.identifier + "' LIMIT 1";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

User.insertUser = async (req) => {
    let sqlQuery = "INSERT INTO users SET username='" + req.username + "', name='" + req.name + "', email='" + req.email + "', phone='" + req.phone + "', gender='" + req.gender + "',profile_image='" + req.profile_image + "',  date_of_birth='" + req.date_of_birth + "', address='" + req.address + "',status='" + req.status + "', role_id='" + req.role_id + "',is_verified=0, password_setup_required=1, verification_token='" + req.verification_token + "',token_expiry='" + req.token_expiry + "', created_at= now()";
    let insert = await sql.query(sqlQuery);
    if (insert.insertId) {
        return insert.insertId;
    }
    else {
        return;
    }
}


User.getUserByToken = async (token) => {

    let sqlQuery = "SELECT * FROM users WHERE verification_token='" + token + "' AND token_expiry > NOW()";
    let rows = await sql.query(sqlQuery);

    if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

User.updatePassword = async (req) => {

    let sqlQuery = " UPDATE users SET password='" + req.password + "', is_verified=1, password_setup_required = 0, verification_token=NULL, token_expiry=NULL WHERE verification_token='" + req.token + "'";
    	let rows = await sql.query(sqlQuery);
	if (!rows.affectedRows) {
		throw "Error while updating the password";
	}
	return rows;
};
module.exports = User;