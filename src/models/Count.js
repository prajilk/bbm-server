const { Schema, model, models } = require('mongoose');

const speciesSchema = new Schema({
    commonName: String,
    binomialName: String,
    image: String,
    count: Number,
});

const countSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    countData: [
        {
            _id: Schema.Types.ObjectId,
            name: String,
            email: String,
            contactNumber: String,
            affiliation: String,
            teamNameOrNumber: String,
            date: Date,
            startTime: String,
            endTime: String,
            location: String,
            coordinates: String,
            altitude: Number,
            distanceCovered: Number,
            weather: String,
            imageLinks: String,
            comments: String,
            speciesFound: [speciesSchema]
        },
    ],
});

module.exports = models.Count || model('Count', countSchema);