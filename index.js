var express = require('express');
var app = express();
var bodyparser = require('body-parser')

var routes = require('./routes');
const { json } = require('express');


const port = 3200;
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use('/api', routes);
app.listen(port, ()=> console.log(`app listening to port ${port}`) );