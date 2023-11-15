const { Schema, model, models } = require('mongoose');

const adminSchema = new Schema({
    email: String,
    password: String
});

module.exports = models.Admin || model('Admin', adminSchema);