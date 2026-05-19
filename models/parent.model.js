const sql = require("../helpers/db.helper.js");

const Parent = function () {};

Parent.insertParent = async (req) => {
  try {
    console.log("PARENT INSERT INPUT:", req);

    const sqlQuery = `
      INSERT INTO parents
      SET
      user_id=${req.user_id},
      parent_code='${req.parent_code}',
      occupation='${req.occupation}',
      relation_with_student='${req.relation_with_student}',
      emergency_contact='${req.emergency_contact}'
    `;

    const result = await sql.query(sqlQuery);

    return result.insertId || null;
  } catch (err) {
    console.log("❌ PARENT INSERT ERROR:", err);
    return null;
  }
};

Parent.updateParent = async (req) => {
  let sqlQuery =
    "  UPDATE parents SET occupation='" +
    req.occupation +
    "', emergency_contact='" +
    req.emergency_contact +
    "' WHERE id='" +
    req.parent_id +
    "'";
  return await sql.query(sqlQuery);
};

Parent.getStudentParent = async ({ student_id, relation }) => {
  let sqlQuery = `
    SELECT 
      p.id AS parent_id,
      p.user_id,
      p.occupation,
      p.emergency_contact,
      p.relation_with_student,
      u.name,
      u.email,
      u.phone
    FROM student_parents sp
    INNER JOIN parents p ON sp.parent_id = p.id
    LEFT JOIN users u ON p.user_id = u.id
    WHERE sp.student_id='${student_id}'
    AND sp.relation='${relation}'
  `;

  return await sql.query(sqlQuery);
};

Parent.checkParentCodeExists = async (req) => {
  let sqlQuery =
    "  SELECT id FROM users  WHERE username='" + req.parentCode + "'";
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Parent.getParentByPhoneOrEmail = async (req) => {
  let sqlQuery =
    "SELECT p.id,p.parent_code,p.user_id,u.name,u.phone,u.email FROM parents p LEFT JOIN users u ON p.user_id = u.id WHERE u.phone='" +
    req.search +
    "' OR u.email='" +
    req.search +
    "'OR p.parent_code='" +
    req.search +
    "'";
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

module.exports = Parent;
