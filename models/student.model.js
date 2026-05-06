const sql = require("../helpers/db.helper.js");

const Student = function () {
};

Student.insertStudent = async (req) => {
    let sqlQuery = "INSERT INTO students SET user_id='" + req.user_id + "', admission_no='" + req.admission_no + "', class_id='" + req.class_id + "', section_id='" + req.section_id + "', roll_no='" + req.roll_no + "', admission_date='" + req.admission_date + "', blood_group='" + req.blood_group + "', academic_year='" + req.academic_year + "'";
    let insert = await sql.query(sqlQuery);
    if (insert.insertId) {
        return insert.insertId;
    }
    else {
        return;
    }
}

Student.getStudentById = async (req) => {
    let sqlQuery = "SELECT st.id AS student_id, ut.name, ut.email, ut.phone, ut.gender, ut.date_of_birth, ut.address, ut.profile_image, ut.status, st.admission_no, st.roll_no, st.admission_date, st.blood_group, st.academic_year, cl.name AS class_name, sec.name AS section_name, tut.name AS class_teacher_name, pu.name AS parent_name, sp.relation AS parent_relation, att.date, att.status FROM students st INNER JOIN users ut  ON st.user_id = ut.id INNER JOIN classes cl ON st.class_id = cl.id INNER JOIN sections sec ON st.section_id = sec.id LEFT JOIN teachers tt ON sec.class_teacher_id = tt.id LEFT JOIN users tut ON tt.user_id = tut.id LEFT JOIN student_parents sp ON st.id = sp.student_id LEFT JOIN parents p ON sp.parent_id = p.id LEFT JOIN users pu ON p.user_id = pu.id LEFT JOIN attendance att ON st.id = att.student_id WHERE st.id = '"+req.student_id+"'";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
}

module.exports = Student;