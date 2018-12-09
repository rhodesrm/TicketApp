const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/user');


router.get('/', (req, res, next) => {
    User.find()
    .select("first_name last_name app_username spotify_username password email location _id")
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            users: docs.map(doc => {
                return {
                    first_name: doc.first_name,
                    last_name: doc.last_name,
                    app_username: doc.app_username,
                    spotify_username: doc.spotify_username,
                    password: doc.password,
                    email: doc.email,
                    location: doc.location,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/users/' + doc._id    // change url after
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
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        app_username: req.body.app_username,
        spotify_username: req.body.spotify_username,
        password: req.body.password,
        email: req.body.email,
        location: req.body.location
    });
    user
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: "Created user successfully",
            createdUser: {
                first_name: result.first_name,
                last_name: result.last_name,
                app_username: result.app_username,
                spotify_username: result.spotify_username,
                password: result.password,
                email: result.email,
                location: result.location,
                _id: result._id,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/users/' + result._id    // change url after
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

router.get('/:userId', (req, res, next) => {
    const id = req.params.userId;
    User.findById(id)
    .select("first_name last_name app_username spotify_username password email location _id")
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if(doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'Get all users',
                    url: 'http://localhost:3000/users/'
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

router.patch("/:userId", (req, res, next) => {
    const id = req.params.userId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propFirstName] = ops.value;
        updateOps[ops.propLastName] = ops.value;
        updateOps[ops.propPassword] = ops.value;
        updateOps[ops.propEmail] = ops.value;
        updateOps[ops.propLocation] = ops.value;
    }                                        
    User.update({_id: id}, { $set: updateOps } )
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'User updated',
            type: 'GET',
            url: 'http://localhost:3000/users/' + id
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
})

router.delete("/:userId", (req, res, next) => {
    const id = req.params.userId;
    User.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'User deleted',
            request: {
                type: 'POST',
                url: 'localhost:3000/users'
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