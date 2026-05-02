const sql    = require("../helpers/db.helper.js");

const Teacher = function () {
};

Teacher.insertTeacher = async (req) => {
    let sqlQuery = "INSERT INTO teachers SET user_id='"+req.user_id+"', qualification='"+req.qualification+"', experience='"+req.experience+"', employee_code='"+req.employee_code+"', subject_specialization='"+req.subject_specialization+"',joining_date='"+req.joining_date+"', salary='"+req.salary+"', emergency_contact='"+req.emergency_contact+"'";
    let insert = await sql.query(sqlQuery);
    if (insert.insertId) {
        return insert.insertId;
    }
    else {
        return;
    }
}

module.exports = Teacher;