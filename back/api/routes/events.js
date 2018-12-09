const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Event = require('../models/event');

function eventsIndex(req, res) {
    Event.find()
      .exec()
      .then(events => res.status(200).json(events))
      .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
  }

  function eventsCreate(req, res) {
    Event.create(req.body)
    .then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Handling POST requests to /events',
            createdEvent: event
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
  }

  function eventsShow(req, res) {
    const id = req.params.eventId;
    Event.findById(id)
    .exec()
    .then(ev => {
        console.log("From database", ev);
        if(ev) {
            res.status(200).json(ev);
        } else {
            res.status(404).json({message: 'No valid entry found for provided ID'});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error: err});
    });
  }

  function eventsUpdate(req, res) {
    Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
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
  }

  function eventsDelete(req, res) {
    Event.findByIdAndRemove(req.params.id)
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
  }

module.exports = {
    index: eventsIndex,
    create: eventsCreate,
    show: eventsShow,
    update: eventsUpdate,
    delete: eventsDelete
};