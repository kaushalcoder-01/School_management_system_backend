const sql = require("../helpers/db.helper.js");

const Class = function () {
};

Class.getClassById = async (req) => {
	let sqlQuery = "SELECT * FROM classes WHERE id = '"+req.class_id+"'";

	let rows = await sql.query(sqlQuery);
	if (rows.length) {
		return rows;
	} else {
		return [];
	}
}

Class.getSection = async (req) => {

    let sqlQuery = " SELECT * FROM sections  WHERE id = '"+req.section_id+"' AND class_id = '"+req.class_id+"'";

    let rows = await sql.query(sqlQuery);
    if (rows.length) {
		return rows;
	} else {
		return [];
	}
};




module.exports = Class