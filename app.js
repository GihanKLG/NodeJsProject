const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const connection = require('./config/database');
app.use(bodyParser.urlencoded({extended:true}));


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

// app.post('/', (req, res) => {
//     console.log("ok");
//     console.log(req.body);
//     // console.log(req);
//     // const title = req.body.title;
//     // const content = req.body.content;
//     // const post = {
//     //     title: title,
//     //     content: content,
//     //     created_at: new Date()
//     // }
//     // connection.query('INSERT INTO `blogpost` SET ?', post, (err) => {
//     //     if (err) console.log(err);
//     //     const result = "success";
//     //     console.log("success");
//     //     res.json({result}); 
//     //     // return res.redirect('/');
//     // });
// });

app.post("/emp", function (req, res) {
    console.log(req.body.content);
});

connection.connect((err) => {
    if (err) console.log(err);
    app.listen(3000);
});