const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    token_id: String,
    location: String
});

module.exports = mongoose.model('User', userSchema);