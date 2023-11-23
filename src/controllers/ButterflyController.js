const { default: mongoose } = require('mongoose');
const Butterfly = require('../models/Butterfly');

function isDateString(str) {
    const date = new Date(str);
    return !isNaN(date.getTime());
}

module.exports = {
    syncData: (date) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = isDateString(date)
                    ? await Butterfly.findOne({ lastUpdated: { $gt: date } }) // return null OR data
                    : await Butterfly.findOne({})

                if (result === null) {
                    // result is null, data is synced
                    resolve({ isSync: true, data: null })
                }
                // result is not null, data is not synced
                resolve({ isSync: false, data: result })
            } catch (error) {
                reject({ isSync: false, data: null })
            }
        })
    },
    getAllButterflies: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Butterfly.find({});
                if (result.length !== 0)
                    resolve(result[0])
                reject()
            } catch (error) {
                reject()
            }
        })
    },
    addButterfly: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const id = new mongoose.Types.ObjectId();
                const result = await Butterfly.updateOne(
                    {}, // No query condition since there's only one document
                    {
                        $set: { lastUpdated: new Date() },
                        $push: {
                            butterflies: {
                                _id: id,
                                commonName: data.commonName,
                                binomialName: data.binomialName,
                                image: data.image
                            }
                        }
                    }
                )
                if (result.modifiedCount > 0) resolve(id)
                reject()
            } catch (error) {
                reject()
            }
        })
    },
    updateButterfly: (id, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Butterfly.updateOne(
                    { "butterflies._id": new mongoose.Types.ObjectId(id) },
                    {
                        $set: {
                            "butterflies.$.commonName": data.commonName,
                            "butterflies.$.binomialName": data.binomialName,
                            "butterflies.$.image": data.image,
                            lastUpdated: new Date()
                        }
                    }
                );
                if (result.modifiedCount > 0) resolve()
                reject()
            } catch (error) {
                reject()
            }
        })
    },
    deleteButterfly: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Butterfly.updateOne(
                    { "butterflies._id": new mongoose.Types.ObjectId(id) },
                    {
                        $set: { lastUpdated: new Date() },
                        $pull: { "butterflies": { "_id": new mongoose.Types.ObjectId(id) } }
                    },
                    { safe: true }
                );
                if (result.modifiedCount > 0) resolve()
                reject()
            } catch (error) {
                reject()
            }
        })
    }
}