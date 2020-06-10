const mysql = require('mysql');
const connection = mysql.createConnection({
    host     : 'localhost', // MYSQL HOST NAME
    user     : 'root',        // MYSQL USERNAME
    password : '',    // MYSQL PASSWORD
    database : 'blog'      // MYSQL DB NAME
});
module.exports = connection;