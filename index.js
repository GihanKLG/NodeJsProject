const mysql = require('mysql');
const express = require('express')
const app = express()
const port = 3000

var mysqlconnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'blog'
});

mysqlconnection.connect((error) => {
    if(!!error)
        console.log('Error');
     else
        console.log('connected..');   
});

app.get('/', (req, res) => {
    mysqlconnection.query('SELECT * FROM blogpost', function(error,result,fields) {
        if(!!error)
            console.log('error in the query');
        else
            res.json({result});   
    })
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));