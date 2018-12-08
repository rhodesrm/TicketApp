const mongoose = require('mongoose');

const venueSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    location: String 
});

module.exports = mongoose.model('Venue', venueSchema);