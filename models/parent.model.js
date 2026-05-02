const sql    = require("../helpers/db.helper.js");

const Parent = function () {
};

Parent.insertParent = async (req) => {
    let sqlQuery = "INSERT INTO parents SET user_id='"+req.user_id+"', occupation='"+req.occupation+"', relation_with_student='"+req.relation_with_student+"', emergency_contact='"+req.emergency_contact+"'";
    let insert = await sql.query(sqlQuery);
    if (insert.insertId) {
        return insert.insertId;
    }
    else {
        return;
    }
}

module.exports = Parent;