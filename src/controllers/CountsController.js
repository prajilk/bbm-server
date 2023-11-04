const { default: mongoose } = require('mongoose');
const Count = require('../models/Count');
const User = require("../models/User");

module.exports = {
    saveCounts: (data) => {
        return new Promise(async (resolve, reject) => {
            const userEmail = data.email;
            try {
                const user = await User.findOne({ email: userEmail });
                const userId = user._id;

                const filter = { user: userId };
                const update = { $addToSet: { countData: { ...data, _id: new mongoose.Types.ObjectId } } };
                const options = { upsert: true };

                // await Count.create({ countData: data, user: userId });
                await Count.updateOne(filter, update, options);
                resolve()
            } catch (error) {
                console.log(error);
                reject()
            }
        })
    },
    getCounts: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const count = await Count.find({ user: id });
                resolve(count[0].countData);
            } catch (error) {
                console.log(error);
                reject()
            }
        })
    }
}