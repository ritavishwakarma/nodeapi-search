var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch')
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
})
var workouts = [
    {
        id: 1,
        type: 'weights',
        durations: 45,
        date: "2/3/2020"
    },
    {
        id:2,
        type: 'run',
        duration: 30,
        date: "3/4/2002"
    }
] 

router.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
})

//get all workouts
router.get('/workouts', (req, res) => {
    return res.status(200).send({
        message: 'get workouts call sucecceded',
        workouts: workouts
    });
})

//get specific workout by id
router.get('/workouts/:id', (req, res) => {
    let workout;
    client.get({
        index: 'workout',
        type: 'mytype',
        id: req.params.id
    }, function( err, resp, status) {
        if(err) {
            console.log(err)
        } else {
            workout = resp._source;
            console.log('Found the requested doc', resp);
            if(!workout){
                return res.status(400).send({
                    message: `workout is not found for the id ${req.params.id}`
                });
            }
            return res.status(200).send({
                message: `Get workout call for the id ${req.params.id} succeed`,
                workout: workout 
            });
        }
    });  
})

//post workout
router.post('/workout', (req, res) => {
    if(!req.body.id){
        return res.status(400).send({
            message: 'id is required'
        });
    }
    client.index({
        index: 'workout',
        type: 'mytype',
        id: req.body.id,
        body: req.body
    }, function(err,resp,status){
        if(err){
            console.log(err);
        }
        else {
            return res.status(200).send({
            message:"post call suceceed"
            })
        }
    
    });  
})

//delete workout by id
router.delete('/workout/:id', (req, res) => {
    client.delete({
        index: 'workout',
        type: 'mytype',
        id: req.params.id
    })
    .then(function(resp) {
        console.log(resp);
    }, function(err) {
        console.trace(err.message);
    });
    
})
module.exports = router;