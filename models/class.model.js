const sql = require("../helpers/db.helper.js");

const Class = function () {};

Class.insertClass = async (req) => {
  const sqlQuery = ` INSERT INTO classes SET name = '${req.name}'`;
  let insert = await sql.query(sqlQuery);
  if (insert.insertId) {
    return insert.insertId;
  } else {
    return;
  }
};

Class.updateClass = async (req) => {
  const sqlQuery = ` UPDATE classes SET name = '${req.name}' WHERE id =  ${req.id} `;
  let insert = await sql.query(sqlQuery);
  if (insert.insertId) {
    return insert.insertId;
  } else {
    return;
  }
};

Class.insertSection = async (req) => {
  const sqlQuery = `  INSERT INTO sections SET  class_id =  ${req.class_id}, name =  '${req.name}', class_teacher_id=  ${req.class_teacher_id} `;
  let insert = await sql.query(sqlQuery);
  if (insert.insertId) {
    return insert.insertId;
  } else {
    return;
  }
};

Class.updateSection = async (req) => {
  const sqlQuery = ` UPDATE sections SET name =  '${req.name}', class_teacher_id=  ${req.class_teacher_id}, WHERE id =  ${req.id}`;
  let insert = await sql.query(sqlQuery);
  if (insert.insertId) {
    return insert.insertId;
  } else {
    return;
  }
};

Class.getClassList = async () => {
  let sqlQuery = "SELECT cl.id AS classId, cl.name, COUNT(sec.id) AS total_sections, GROUP_CONCAT(sec.name ORDER BY sec.name SEPARATOR ', ') AS section_names FROM classes cl LEFT JOIN sections sec ON sec.class_id = cl.id GROUP BY cl.id, cl.name ORDER by cl.id DESC;";
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Class.getSectionList = async (req) => {
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

Class.getClassById = async (req) => {
  let sqlQuery = "SELECT * FROM classes WHERE id = '" + req.class_id + "'";
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Class.getSection = async (req) => {
  let sqlQuery =
    " SELECT * FROM sections  WHERE id = '" +
    req.section_id +
    "' AND class_id = '" +
    req.class_id +
    "'";
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Class.checkTeacherAssigned = async (teacherId, sectionId = null) => {
  let sqlQuery = `
    SELECT
      s.id,
      s.name AS section_name,
      c.name AS class_name
    FROM sections s
    INNER JOIN classes c
      ON s.class_id = c.id
    WHERE s.class_teacher_id = ${teacherId}
  `;

  if (sectionId) {
    sqlQuery += ` AND s.id != ${sectionId}`;
  }

  return await sql.query(sqlQuery);
};

Class.getTeachersForClass = async () => {
  let sqlQuery =
    "SELECT  t.id,  u.name, sec.id AS section_id, CONCAT(c.name,' - ',sec.name) AS assigned_section FROM teachers t INNER JOIN users u ON t.user_id = u.id LEFT JOIN sections sec ON sec.class_teacher_id = t.id LEFT JOIN classes c ON sec.class_id = c.id ORDER BY u.name";
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

module.exports = Class;
