const mysql = require('mysql');

const dbConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "electricitydb"
})

dbConnection.connect((error) => {
    if (error) {
        throw error;
    } else {
        console.log('mySql connection success')
    }
})

module.exports = { dbConnection }