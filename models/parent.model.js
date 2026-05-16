const sql = require("../helpers/db.helper.js");

const Parent = function () {
};

Parent.insertParent = async (req) => {
    let sqlQuery = "INSERT INTO parents SET user_id='" + req.user_id + "', parent_code='" + req.parent_code + "', occupation='" + req.occupation + "', relation_with_student='" + req.relation_with_student + "', emergency_contact='" + req.emergency_contact + "'";
    let insert = await sql.query(sqlQuery);
    if (insert.insertId) {
        return insert.insertId;
    }
    else {
        return;
    }
}

Parent.getNextParentCode = async () => {

    let sqlQuery = "SELECT IFNULL(MAX(id),0)+1 AS next_id FROM parents";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
};

Parent.getParentByPhoneOrEmail = async (req) => {

    let sqlQuery = "SELECT p.id,p.parent_code,p.user_id,u.name,u.phone,u.email FROM parents p LEFT JOIN users u ON p.user_id = u.id WHERE u.phone='" + req.phone + "' OR u.email='" + req.email + "'";
    let rows = await sql.query(sqlQuery);
    if (rows.length) {
        return rows;
    } else {
        return [];
    }
};


module.exports = Parent;