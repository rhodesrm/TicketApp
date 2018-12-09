const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Venue = require('../models/venue');



router.get('/', (req, res, next) => {
    Venue.find()
    .select("name location _id")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            venues: docs.map(doc => {
                return {
                    name: doc.name,
                    location: doc.location,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/venues/' + doc._id    // change url after
                    }
                }
            })
        };
        res.status(200).json(response);
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
            message: "Created venue successfully",
            createdVenue: {
                name: result.name,
                location: result.location,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/venues/' + result._id    // change url after
                }
            }
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
    .select("name location _id")
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if(doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'Get all venues',
                    url: 'http://localhost:3000/venues/'
                }
            });
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
        updateOps[ops.propLocation] = ops.value;
    }                                        
    Venue.update({_id: id}, { $set: updateOps } )
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Venue updated',
            type: 'GET',
            url: 'http://localhost:3000/venues/' + id
        });
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
        res.status(200).json({
            message: 'Venue deleted',
            request: {
                type: 'POST',
                url: 'localhost:3000/venues/'
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});


module.exports = router;