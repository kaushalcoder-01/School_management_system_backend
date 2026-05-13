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

Teacher.getTeacherList = async (req) => {
    let sqlQuery = "SELECT tt.id AS teacher_id, ut.name AS teacher_name, ut.email, ut.phone, sub.name AS subject_name, cl.name AS class_name, sec.name AS section_name FROM teacher_subjects ts INNER JOIN teachers tt ON ts.teacher_id = tt.id INNER JOIN users ut ON tt.user_id = ut.id INNER JOIN subjects sub ON ts.subject_id = sub.id INNER JOIN classes cl ON ts.class_id = cl.id INNER JOIN sections sec ON ts.section_id = sec.id WHERE ts.class_id = '"+req.class_id+"' AND ts.section_id = '"+req.section_id+"'";;
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
}

Teacher.getNextEmployeeCode = async () => {

    let sqlQuery = " SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM teachers";
    let rows = await sql.query(sqlQuery);
      if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

Teacher.getClassList = async () => {

    let sqlQuery = "SELECT id, name FROM classes ORDER BY id ASC";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

Teacher.getSectionList = async (req) => {
    let sqlQuery = "SELECT id, name FROM sections WHERE class_id='" + req.class_id + "' ORDER BY name ASC";
    
    let rows = await sql.query(sqlQuery);
        console.log(rows)
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

module.exports = Teacher;