const sql = require("../helpers/db.helper.js");

const Subject = function () {};

Subject.getSubjectList = async (req) => {
  let sqlQuery = "SELECT id, name FROM subjects ORDER BY name ASC";
  let rows = await sql.query(sqlQuery);
  console.log(rows);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

module.exports = Subject;
