const sql    = require("../helpers/db.helper.js");

const Student = function () {
};

Student.insertStudent = async (req) => {
    let sqlQuery = "INSERT INTO students SET user_id='"+req.user_id+"', admission_no='"+req.admission_no+"', class_id='"+req.class_id+"', section_id='"+req.section_id+"', parent_id='"+req.parent_id+"',roll_no='"+req.roll_no+"', admission_date='"+req.admission_date+"', blood_group='"+req.blood_group+"', academic_year='"+req.academic_year+"'";
    let insert = await sql.query(sqlQuery);
    if (insert.insertId) {
        return insert.insertId;
    }
    else {
        return;
    }
}

module.exports = Student;