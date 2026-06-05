const sql = require("../helpers/db.helper.js");

const User = function () {
  if (typeof user.user_id != "undefined") {
    this.user_id = user.user_id;
  }
  this.name = user.name;
  this.email = user.email;
  this.password = user.password;
  this.profile_image = user.profile_image;
   this.teacher_id = user.teacher_id;
  this.student_id= user.student_id;
  this.parent_id= user.parent_id;
  //this.status        = user.status;
};

User.userDetailsByLogin = async (req) => {
  let sqlQuery =
    "SELECT ut.id AS user_id, ut.username, ut.name, ut.email, ut.password, ut.profile_image,  ut.is_verified, rt.name AS role, t.id AS teacher_id, s.id AS student_id, p.id AS parent_id FROM users ut INNER JOIN roles rt on ut.role_id = rt.id LEFT JOIN teachers t ON t.user_id = ut.id LEFT JOIN students s ON s.user_id = ut.id LEFT JOIN parents p ON p.user_id = ut.id WHERE ut.email = '" +
    req.identifier +
    "' OR ut.username = '" +
    req.identifier +
    "' LIMIT 1";
  let rows = await sql.query(sqlQuery);
  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

User.insertUser = async (req) => {
  let sqlQuery =
    "INSERT INTO users SET username='" +
    req.username +
    "', name='" +
    req.name +
    "', email='" +
    req.email +
    "', phone='" +
    req.phone +
    "', gender='" +
    req.gender +
    "',profile_image='" +
    req.profile_image +
    "',  date_of_birth='" +
    req.date_of_birth +
    "', address='" +
    req.address +
    "',status='" +
    req.status +
    "', role_id='" +
    req.role_id +
    "',is_verified=0, is_login_enabled='" +
    (req.is_login_enabled ? 1 : 0) +
    "' ,password_setup_required=1, verification_token='" +
    req.verification_token +
    "',token_expiry='" +
    req.token_expiry +
    "', created_at= now()";
  let insert = await sql.query(sqlQuery);
  console.log("USER INSERT RESULT:", insert);
  if (insert.insertId) {
    return insert.insertId;
  } else {
    return;
  }
};

User.getUserByToken = async (token) => {
  let sqlQuery =
    "SELECT * FROM users WHERE verification_token='" +
    token +
    "' AND token_expiry > NOW()";
  let rows = await sql.query(sqlQuery);

  if (rows.length) {
    return rows;
  } else {
    return [];
  }
};

User.updatePassword = async (req) => {
  let sqlQuery =
    " UPDATE users SET password='" +
    req.password +
    "', is_verified=1, password_setup_required = 0, verification_token=NULL, token_expiry=NULL WHERE verification_token='" +
    req.token +
    "'";
  let rows = await sql.query(sqlQuery);
  if (!rows.affectedRows) {
    throw "Error while updating the password";
  }
  return rows;
};

User.updateUser = async (req) => {
  let sqlQuery =
    " UPDATE users SET name='" +
    req.name +
    "', email='" +
    req.email +
    "', phone='" +
    req.phone +
    "', gender='" +
    req.gender +
    "', date_of_birth='" +
    req.date_of_birth +
    "', address='" +
    req.address +
    "',profile_image='" +
    req.profile_image +
    "',status='" +
    req.status +
    "' WHERE id='" +
    req.user_id +
    "'";

  return await sql.query(sqlQuery);
};

User.updateParentUser = async (req) => {
  let sqlQuery =
    " UPDATE users SET name='" +
    req.name +
    "', email='" +
    req.email +
    "',phone='" +
    req.phone +
    "',address='" +
    req.address +
    "',gender='" +
    req.gender +
    "',date_of_birth='" +
    req.date_of_birth +
    "',profile_image='" +
    req.profile_image +
    "' WHERE id='" +
    req.user_id +
    "'  ";

  return await sql.query(sqlQuery);
};
module.exports = User;
