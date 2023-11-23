const { Schema, model, models } = require('mongoose');

const butterflySchema = new Schema({
    lastUpdated: Date,
    butterflies: [
        {
            _id: Schema.Types.ObjectId,
            commonName: String,
            binomialName: String,
            image: String
        }
    ],
});

module.exports = models.Butterfly || model('Butterfly', butterflySchema);