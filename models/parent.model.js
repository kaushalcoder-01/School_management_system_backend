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

Parent.getParentList = async () => {
  let sqlQuery = "SELECT p.id AS parent_id, pu.id AS user_id, pu.name AS parent_name, pu.email AS parent_email, pu.phone AS parent_phone, pu.address, pu.is_login_enabled AS login_access,pu.status AS parent_status, pu.profile_image AS parent_profile_image, p.occupation, p.relation_with_student, st.id AS student_id, st.class_id, st.section_id, su.name AS student_name, su.email AS student_email, su.gender, st.roll_no, st.admission_no, cl.name AS class_name, sec.name AS section_name, sp.relation FROM parents p LEFT JOIN users pu ON p.user_id = pu.id LEFT JOIN student_parents sp ON p.id = sp.parent_id LEFT JOIN students st ON sp.student_id = st.id LEFT JOIN users su ON st.user_id = su.id LEFT JOIN classes cl ON st.class_id = cl.id LEFT JOIN sections sec ON st.section_id = sec.id WHERE  pu.is_login_enabled = 1  ORDER BY p.id DESC";
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

Parent.getParentById = async ({ parent_id }) => {

  let sqlQuery = `
  
    SELECT 
      p.id AS parent_id,
      pu.id AS user_id,
      pu.name AS parent_name,
      pu.email AS parent_email,
      pu.phone AS parent_phone,
      pu.address,
      pu.gender  AS parent_gender,
      pu.profile_image AS parent_profile_image,
      pu.status AS parent_status,
      p.occupation,
      p.relation_with_student,
      p.parent_code,
      st.id AS student_id,
      st.class_id,
      st.section_id,
      st.roll_no,
      st.admission_no,
      su.name AS student_name,
      su.email AS student_email,
      su.gender,
      su.status,
      su.profile_image,
      cl.name AS class_name,
      sec.name AS section_name,
      sp.relation
    FROM parents p

    LEFT JOIN users pu
      ON p.user_id = pu.id

    LEFT JOIN student_parents sp
      ON p.id = sp.parent_id

    LEFT JOIN students st
      ON sp.student_id = st.id

    LEFT JOIN users su
      ON st.user_id = su.id

    LEFT JOIN classes cl
      ON st.class_id = cl.id

    LEFT JOIN sections sec
      ON st.section_id = sec.id

    WHERE p.id='${parent_id}'
  `;

  return await sql.query(sqlQuery);
};

module.exports = Parent;
