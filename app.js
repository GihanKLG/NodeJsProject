const express = require('express');
const app = express();
const bodyParser = require("body-parser");

const connection = require('./config/database');
app.use(bodyParser.json());


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

app.post("/", function (req, res, next) {
    console.log(req.body);
    const title = req.body.title;
    const content = req.body.content;
    const post = {
        title: title,
        content: content,
    }
    console.log(post);
    connection.query('INSERT INTO `blogpost` SET ?', post, (err) => {
        if (err) console.log(err);
        else{
        const result = "data insert successfully";
        console.log("success");
        res.json({result}); 
        }
    });
});

app.get('/:id' , (req, res) => { 
    console.log(req.params.id);
    connection.query('SELECT * FROM `blogpost` WHERE id = ?', [req.params.id], (err, result, fields) => {
        if(err) console.log(err);
        else{
            console.log("success");
            res.json({result});
        }
    })
})

app.put('/', (req, res) => {
    console.log(req.body);
    let sql = `Update blogpost 
                SET title = ? 
                WHERE id = ?`;
    let data = [req.body.title, req.body.content, req.body.id];           
    connection.query(sql, data, (err, result, fields) => {
        if(err) console.log(err); 
        else{
            const result = "data update successfully";
            console.log("success");
            res.json({result}); 
         }
    })
})

app.delete('/:id' , (req, res) => {
    console.log(req.params.id);
    connection.query('DELETE FROM `blogpost` WHERE id = ?', [req.params.id], (err, result, fields) =>{
        if(err) console.log(err);
        else{
            var result = "Row is successfully deleted";
            console.log("success");
            res.json({result});
        }
    })
});

connection.connect((err) => {
    if (err) console.log(err);
    app.listen(3000);
});

