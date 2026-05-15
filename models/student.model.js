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

Student.linkParent = async (req) => {

    let sqlQuery = "INSERT INTO student_parents SET student_id='" + req.student_id +"', parent_id='" +req.parent_id +"', relation='" + req.relation +"'";
    let insert = await sql.query(sqlQuery);
    if (insert.insertId) {
        return insert.insertId;
    }
    else {
        return;
    }
};

Student.getStudentById = async (req) => {
    let sqlQuery = "SELECT st.id AS studentId, ut.id AS userId, ut.name, ut.email, ut.phone, ut.gender, ut.date_of_birth, ut.address, ut.profile_image, ut.status, st.admission_no, st.roll_no, st.admission_date, st.blood_group, st.academic_year, st.facl.name AS class_name, sec.name AS section_name, tut.name AS class_teacher_name, pu.name AS parent_name, sp.relation AS parent_relation, att.date, att.status AS attendance_status FROM students st INNER JOIN users ut  ON st.user_id = ut.id INNER JOIN classes cl ON st.class_id = cl.id INNER JOIN sections sec ON st.section_id = sec.id LEFT JOIN teachers tt ON sec.class_teacher_id = tt.id LEFT JOIN users tut ON tt.user_id = tut.id LEFT JOIN student_parents sp ON st.id = sp.student_id LEFT JOIN parents p ON sp.parent_id = p.id LEFT JOIN users pu ON p.user_id = pu.id LEFT JOIN attendance att ON st.id = att.student_id WHERE ut.id = '"+req.user_id+"'";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
}

Student.getStudentList = async (req) => {
    let sqlQuery = "SELECT st.id AS studentId, ut.id AS userId, ut.name, ut.email, ut.phone, ut.gender, ut.profile_image, ut.status, st.admission_no, st.roll_no, st.academic_year, cl.name AS class_name, sec.name AS section_name, tut.name AS class_teacher_name, GROUP_CONCAT(DISTINCT CONCAT(pu.name, ' (', sp.relation, ')')) AS parents FROM students st INNER JOIN users ut ON st.user_id = ut.id INNER JOIN classes cl ON st.class_id = cl.id INNER JOIN sections sec ON st.section_id = sec.id LEFT JOIN teachers tt ON sec.class_teacher_id = tt.id LEFT JOIN users tut ON tt.user_id = tut.id LEFT JOIN student_parents sp ON st.id = sp.student_id LEFT JOIN parents p ON sp.parent_id = p.id LEFT JOIN users pu ON p.user_id = pu.id WHERE st.class_id = '" + req.class_id + "' AND st.section_id = '" + req.section_id + "' GROUP BY st.id ORDER BY st.id DESC;";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
}

Student.getNextRollNo = async (req) => {

    let sqlQuery = "SELECT  COALESCE(MAX(CAST(roll_no AS UNSIGNED)), 0) + 1 AS next_roll_no  FROM students WHERE class_id = '" + req.class_id + "' AND section_id = '" + req.section_id + "'";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

Student.getNextAdmissionNo = async () => {

    let sqlQuery = " SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM students";
    let rows = await sql.query(sqlQuery);
      if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

Student.markAttendance = async (req) => {
    let sqlQuery = "INSERT INTO attendance SET student_id='" + req.student_id + "', date='" + req.date  + "',status='" + req.status + "', marked_by='" + req.marked_by + "'";       
 let rows = await sql.query(sqlQuery);
      if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

Student.getAttendanceList = async (req) => {

    let sqlQuery = "SELECT st.id AS student_id, u.name, st.roll_no, att.date, att.status, att.marked_by FROM students st INNER JOIN users u ON st.user_id = u.id LEFT JOIN attendance att ON st.id = att.student_id AND att.date = CURDATE() WHERE st.class_id = '" + req.class_id + "' AND st.section_id = '" + req.section_id + "'";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

Student.getAttendanceById = async (req, res) => {

    let sqlQuery = "SELECT date, status FROM attendance  WHERE student_id='" + req.student_id + "' AND MONTH(date)='" + req.month + "' AND YEAR(date)='" + req.year + "' ORDER BY date ASC";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

module.exports = Student;