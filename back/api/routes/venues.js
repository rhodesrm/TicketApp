const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Venue = require('../models/venue');


router.get('/', (req, res, next) => {
    Venue.find()
    .exec()
    .then(docs => {
        console.log(docs);
        res.status(200).json(docs);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.post('/', (req, res, next) => {
    const venue = new Venue({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        location: req.body.location
    });
    venue
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Handling POST requests to /venues',
            createdVenue: venue
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    
});

router.get('/:venueId', (req, res, next) => {
    const id = req.params.venueId;
    Venue.findById(id)
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if(doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({message: 'No valid entry found for provided ID'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
});

router.patch("/:venueId", (req, res, next) => {
    const id = req.params.venueId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Venue.update({_id: id}, { $set: updateOps })
    .exec()
    .then(result => {
        console.log(res);
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
})

router.delete("/:venueId", (req, res, next) => {
    const id = req.params.venueId;
    Venue.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json(result);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

module.exports = router;