const mysql 	 = require("mysql2");
const util 		 = require('util')
const config 	 = require("../config/config.js");

const hostname = config.DB_HOST;
const dbname	 = config.DB_NAME;
const dbuname	 = config.DB_USER;
const dbpass	 = config.DB_PASSWORD;
const dir 		 = config.FILE_PATH;
const port 		 = config.API_PORT;

const conn = mysql.createConnection({
  host: hostname,
  user: dbuname,
  password: dbpass,
  database: dbname
});
  
 
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});

conn.query = util.promisify(conn.query);

module.exports = conn;