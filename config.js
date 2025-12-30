const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'crp-db.c726ak8aokw6.ap-south-1.rds.amazonaws.com',
    user: 'admin',
    password: 'AXVx3VU1eGT87up268ZW',
    database: 'crp-db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

module.exports = connection;  // Export the connection
