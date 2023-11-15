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
                reject()
            }
        })
    },
    getAllCounts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const counts = await Count.find({});
                if (counts) {
                    const countData = counts.flatMap((count) =>
                        count.countData.map((innerObj) => ({ data: innerObj, user: count.user }))
                    );

                    resolve(countData)
                }
                reject()
            } catch (error) {
                reject()
            }
        })
    },
    getUserCounts: (user) => {
        return new Promise(async (resolve, reject) => {
            try {
                const userDetails = await User.findById({ _id: user }, { password: 0, __v: 0 })
                const countData = await Count.findOne({ user });
                if (countData && countData.countData)
                    resolve({ counts: countData.countData, user: userDetails })
                reject()
            } catch (error) {
                reject()
            }
        })
    },
    deleteCount(id, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const deletedData = await Count.updateOne({ user }, { "$pull": { "countData": { "_id": new mongoose.Types.ObjectId(id) } } }, { safe: true })
                if (deletedData.modifiedCount !== 0)
                    resolve()
                else reject()
            } catch (error) {
                reject()
            }
        })
    }
}