const sql = require("../helpers/db.helper.js");

const Teacher = function () {};

Teacher.insertTeacher = async (req) => {
  let sqlQuery =
    "INSERT INTO teachers SET user_id='" +
    req.user_id +
    "', qualification='" +
    req.qualification +
    "', experience='" +
    req.experience +
    "', employee_code='" +
    req.employee_code +
    "', subject_specialization='" +
    req.subject_specialization +
    "',joining_date='" +
    req.joining_date +
    "', salary='" +
    req.salary +
    "', emergency_contact='" +
    req.emergency_contact +
    "'";
  let insert = await sql.query(sqlQuery);
  if (insert.insertId) {
    return insert.insertId;
  } else {
    return;
  }
};

Teacher.updateTeacher = async (req) => {

  let sqlQuery = `
    UPDATE teachers
    SET
      qualification='${req.qualification}',
      experience='${req.experience}',
      subject_specialization='${req.subject_specialization}',
      joining_date='${req.joining_date}',
      salary='${req.salary}',
      emergency_contact='${req.emergency_contact}'
    WHERE id='${req.teacher_id}'
  `;
  return await sql.query(sqlQuery);
};

Teacher.getTeacherList = async (req) => {
  let sqlQuery = `
    SELECT
    tt.id AS teacher_id,

    ut.name AS teacher_name,
    ut.email,
    ut.phone,
    ut.gender,
    ut.profile_image,
    ut.status,

    tt.qualification,
    tt.experience,
    tt.employee_code,
    tt.subject_specialization,
    tt.salary,

    sub.name AS subject_name,

    cl.name AS class_name,
    cl.id AS class_id,

    sec.name AS section_name,
    sec.id AS section_id,

    CASE
        WHEN sec.class_teacher_id = tt.id
        THEN 1
        ELSE 0
    END AS is_class_teacher

    FROM teachers tt

    INNER JOIN users ut
    ON tt.user_id = ut.id

    LEFT JOIN teacher_subjects ts
    ON ts.teacher_id = tt.id

    LEFT JOIN subjects sub
    ON ts.subject_id = sub.id

    LEFT JOIN classes cl
    ON ts.class_id = cl.id

    LEFT JOIN sections sec
    ON ts.section_id = sec.id

    ORDER BY tt.id DESC;`;
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Teacher.getTeacherById = async (req) => {
  let sqlQuery = `SELECT

    tt.id AS teacher_id,

    ut.name AS teacher_name,
    ut.email,
    ut.phone,
    ut.gender,
    ut.profile_image,
    ut.status,
    ut.address,

    tt.qualification,
    tt.experience,
    tt.employee_code,
    tt.subject_specialization,
    tt.joining_date,
    tt.salary,
    tt.emergency_contact

    FROM teachers tt

    INNER JOIN users ut
    ON tt.user_id = ut.id

    WHERE tt.id = '${req.teacher_id}'`;
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Teacher.getTeacherAssignments = async (req) => {
  let sqlQuery = `
  SELECT

  sub.name AS subject_name,

  cl.name AS class_name,

  sec.name AS section_name,

  ts.subject_id,
  ts.class_id,
  ts.section_id

FROM teacher_subjects ts

INNER JOIN subjects sub
ON ts.subject_id = sub.id

INNER JOIN classes cl
ON ts.class_id = cl.id

INNER JOIN sections sec
ON ts.section_id = sec.id

WHERE ts.teacher_id = '${req.teacher_id}'`;
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Teacher.getClassTeacherOf = async (req) => {
  let sqlQuery = `
SELECT

  cl.name AS class_name,

  sec.name AS section_name,

  sec.id AS section_id

FROM sections sec

INNER JOIN classes cl
ON sec.class_id = cl.id

WHERE sec.class_teacher_id = '${req.teacher_id}'`;
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Teacher.getNextEmployeeCode = async (req) => {
  let sqlQuery =
    "SELECT id  FROM users WHERE username='" + req.employeeCode + "'";
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
  let sqlQuery =
    "SELECT id, name FROM sections WHERE class_id='" +
    req.class_id +
    "' ORDER BY name ASC";

  let rows = await sql.query(sqlQuery);
  console.log(rows);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Teacher.getSubjectList = async (req) => {
  let sqlQuery =
    "SELECT id, name FROM sections WHERE class_id='" +
    req.class_id +
    "' ORDER BY name ASC";

  let rows = await sql.query(sqlQuery);
  console.log(rows);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Teacher.addTeacherSubject = async (req) => {
  let sqlQuery ="INSERT INTO teacher_subjects SET teacher_id='" +req.teacher_id +"', subject_id='" +req.subject_id +"', class_id='" +req.class_id + "', section_id='" +  req.section_id +  "'";
  let insert = await sql.query(sqlQuery);
  if (insert.insertId) {
    return insert.insertId;
  } else {
    return;
  }
};

Teacher.assignClassTeacher = async (req) => {
  let sqlQuery = "UPDATE sections SET class_teacher_id='" + req.teacher_id + "' WHERE id='" +req.section_id +"'";
  return await sql.query(sqlQuery);
};

Teacher.getSectionClassTeacher = async (req) => {

  let sqlQuery = `
  
    SELECT 
      sec.id,
      sec.name AS section_name,
      cl.name AS class_name,
      sec.class_teacher_id,
      u.name AS teacher_name

    FROM sections sec

    INNER JOIN classes cl
    ON sec.class_id = cl.id

    LEFT JOIN teachers t
    ON sec.class_teacher_id = t.id

    LEFT JOIN users u
    ON t.user_id = u.id

    WHERE sec.id='${req.section_id}'
  `;

  return await sql.query(sqlQuery);
};

Teacher.getClassTeacherSections = async () => {
  let sqlQuery = `
  
    SELECT 
      sec.id AS section_id,
      cl.name AS class_name,
      sec.name AS section_name,
      sec.class_teacher_id,
      COALESCE(u.name, 'Available') AS teacher_name

    FROM sections sec

    INNER JOIN classes cl
    ON sec.class_id = cl.id

    LEFT JOIN teachers t
    ON sec.class_teacher_id = t.id

    LEFT JOIN users u
    ON t.user_id = u.id

    ORDER BY cl.name, sec.name
  `;

  return await sql.query(sqlQuery);
};

Teacher.checkSubjectAlreadyAssigned = async (req) => {

  let sqlQuery = `
  
    SELECT 
      ts.id,
      u.name AS teacher_name

    FROM teacher_subjects ts

    INNER JOIN teachers t
    ON ts.teacher_id = t.id

    INNER JOIN users u
    ON t.user_id = u.id

    WHERE ts.subject_id='${req.subject_id}'
    AND ts.class_id='${req.class_id}'
    AND ts.section_id='${req.section_id}'
  `;

  return await sql.query(sqlQuery);
};

Teacher.checkSubjectAlreadyAssignedForUpdate =async (req) => {

  let sqlQuery = `
  
    SELECT 
      ts.id,
      u.name AS teacher_name

    FROM teacher_subjects ts

    INNER JOIN teachers t
    ON ts.teacher_id = t.id

    INNER JOIN users u
    ON t.user_id = u.id

    WHERE ts.subject_id='${req.subject_id}'
    AND ts.class_id='${req.class_id}'
    AND ts.section_id='${req.section_id}'
    AND ts.teacher_id!='${req.teacher_id}'
  `;

  return await sql.query(sqlQuery);
};

module.exports = Teacher;
