var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch')
const mongoose     = require('mongoose');
const mongoosastic = require('mongoosastic');

mongoose.connect('mongodb://localhost:27017/mongodata', { useFindAndModify: false });

var workoutsSchema = new mongoose.Schema({
    type: String
  , durations: Number
  , date: String
});

workoutsSchema.plugin(mongoosastic, {
    "host": "localhost",
    "port": 9200
    
});
var Newworkout = mongoose.model('Newworkout', workoutsSchema);

Newworkout.createMapping((err, mapping) => {
    console.log('mapping created');
});


router.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
})

//get all workouts
router.get('/workouts', (req, res) => {
    const workouts = Newworkout.find()
    .then((workouts) => {
        res.json({workouts: workouts})
    })
        .catch(err => console.log(err));
    
});

//post workout
router.post('/workouts', (req, res) => {
    const workouts =  Newworkout(req.body)
    workouts.save((err) => {
        if(err) {
            console.log(err);
        }
        console.log('user added in both the databases');
    })
    
    workouts.on('es-indexed', (err, result) => {
        console.log('indexed to elastic search');
    });
});       

//search-workout-by-id
router.get('/workouts/:id', (req, res) => {
    Newworkout.findById(req.params.id)
    .then(workouts => {
        if(!workouts) {
            return res.status(404).send({
                message: "workout not found with id " + req.params.id
            });            
        }
        res.send(workouts);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "workout not found with id " + req.params.id
            });                
        }
        return res.status(500).send({
            message: "Something wrong retrieving product with id " + req.params.id
        });
    });

});

//update workout by id
router.put('/workouts/:id', (req, res) => {
    if(!req.body) {
        return res.status(400).send({
            message: "workout content can not be empty"
        });
    }
    Newworkout.findByIdAndUpdate(req.params.id, {
        type: req.body.type || "No workout type", 
        durations: req.body.durations,
        date: req.body.date,
    }, {new: true})
    .then(workouts => {
        if(!workouts) {
            return res.status(404).send({
                message: "Workout not found with id " + req.params.id
            });
        }
        res.send(workouts);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Workout not found with id " + req.params.id
            });                
        }
        return res.status(500).send({
            message: "Something wrong updating note with id " + req.params.id
        });
    });
    
});

router.delete('workouts/:id', (req, res) => {
    Newworkout.findByIdAndRemove(req.params.id)
    .then(workouts => {
        if(!workouts) {
            return res.status(404).send({
                message: "workout not found with id " + req.params.id
            });
        }
        res.send({message: "workout deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "workout not found with id " + req.params.id
            });                
        }
        return res.status(500).send({
            message: "Could not delete workout with id " + req.params.id
        });
    });
});

  
Newworkout.on('es-indexed', (err, result) => {
    console.log('indexed to elastic search');
});

module.exports = router;