const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    app_username: { type: String, required: true }, 
    spotify_username: String,
    password: { type: String, required: true },
    email: { type: String, required: true },
    location: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);