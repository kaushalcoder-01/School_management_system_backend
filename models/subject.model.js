const sql = require("../helpers/db.helper.js");

const Subject = function () {};

Subject.getSubjectList = async (req) => {
  let sqlQuery = "SELECT * FROM subjects ORDER BY id DESC";
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Subject.addSubject = async (req) => {
  const sqlQuery = ` INSERT INTO subjects SET name = '${req.name}',  subject_code= '${req.subject_code}', is_active ='${req.is_active || 1}', created_at = NOW()`;
  let insert = await sql.query(sqlQuery);
  if (insert.insertId) {
    return insert.insertId;
  } else {
    return;
  }
};

Subject.updateSubject = async (req) => {

  const sqlQuery = ` UPDATE subjects SET name = '${req.name}',  is_active = '${req.is_active || 1}'  WHERE id = ${req.id} `;

  return await sql.query(sqlQuery);
};

Subject.checkSubjectCode = async (subjectCode) => {
  const sqlQuery = `  SELECT id FROM subjects WHERE subject_code = '${subjectCode}'  `;
  const rows = await sql.query(sqlQuery);
  return rows || [];
};

module.exports = Subject;
