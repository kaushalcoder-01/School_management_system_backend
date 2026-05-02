const sql    = require("../helpers/db.helper.js");

const User = function () {
    if (typeof user.user_id != 'undefined') {
        this.user_id = user.user_id;
    }
    this.name          = user.name;
    this.email         = user.email;
    this.password      = user.password;
    this.profile_image = user.profile_image;
    //this.status        = user.status;
};


User.userDetailsByEmail = async (req) => {
    let sqlQuery = "SELECT ut.id AS user_id, ut.name, ut.email, ut.password, ut.profile_image, rt.name AS role FROM users ut inner join roles rt on ut.role_id = rt.id WHERE ut.email = '"+req.email+"'";
	let rows = await sql.query(sqlQuery);
	if (rows.length) {
		return rows;
	} else {
		return [];
	}
};

User.insertUser = async (req) => {
	let sqlQuery = "INSERT INTO users SET name='"+req.name+"', email='"+req.email+"', phone='"+req.phone+"', password='"+req.password+"',profile_image='"+req.profile_image+"', gender='"+req.gender+"', date_of_birth='"+req.date_of_birth+"', address='"+req.address+"',status='"+req.status+"', role_id='"+req.role_id+"', created_at= now()";
	let insert = await sql.query(sqlQuery);
	if (insert.insertId) {
        return insert.insertId;
    }
    else {
        return;
    }
}

module.exports = User;