const express = require('express');
const app = express();

const connection = require('./config/database');

app.get('/', (req, res) => {
    connection.query('SELECT * FROM blogpost', function(error,result,fields) {
        if(!!error)
            console.log('error in the query');
        else
        {
            console.log("success");
            res.json({result}); 
        }      
    })
});

app.post('/', (req, res) => {
    console.log(req);
    const title = req.body.title;
    const content = req.body.content;
    const post = {
        title: title,
        content: content,
        created_at: new Date()
    }
    connection.query('INSERT INTO `blogpost` SET ?', post, (err) => {
        if (err) console.log(err);
        const result = "success";
        console.log("success");
        res.json({result}); 
        // return res.redirect('/');
    });
});

connection.connect((err) => {
    if (err) console.log(err);
    app.listen(3000);
});