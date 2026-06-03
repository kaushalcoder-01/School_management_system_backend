const sql = require("../helpers/db.helper.js");

const Dashboard = function () {};

Dashboard.getSummary = async () => {
  const sqlQuery = `
    SELECT

      (SELECT COUNT(*) FROM students) AS total_students,

      (SELECT COUNT(*) FROM teachers) AS total_teachers,

      (SELECT COUNT(*) FROM parents) AS total_parents,

      (SELECT COUNT(*) FROM users WHERE role_id = 1) AS total_admins,

      (SELECT COUNT(*) FROM classes) AS total_classes,

      (SELECT COUNT(*) FROM sections) AS total_sections,

      (SELECT COUNT(*) FROM subjects) AS total_subjects
  `;

  const rows = await sql.query(sqlQuery);

  return rows[0];
};

Dashboard.addLog = async (req) => {
  const sqlQuery = ` INSERT INTO activity_logs SET title = '${req.title}', description = '${req.description}', activity_type = '${req.activity_type}', created_by = '${req.created_by}'`;
  let insert = await sql.query(sqlQuery);
  if (insert.insertId) {
    return insert.insertId;
  } else {
    return;
  }
};

Dashboard.getLog = async () => {
  const sqlQuery = ` SELECT * FROM activity_logs `;

  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};




module.exports = Dashboard;
