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

                await Count.updateOne(filter, update, options);
                resolve()
            } catch (error) {
                reject()
            }
        })
    },
    getCount: (id, user) => {
        return new Promise(async (resolve, reject) => {
            try {
                const userDetails = await User.findById({ _id: user }, { password: 0, __v: 0 })
                const count = await Count.findOne({ user });
                const countData = count.countData;
                const result = countData.find((data) => (data._id.toString() === id))
                const response = {
                    count: result,
                    user: userDetails
                }
                resolve(response);
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
    updateCount: (countId, user, data) => {
        return new Promise(async (resolve, reject) => {
            try {
                await Count.findOneAndUpdate(
                    { user, "countData._id": countId },
                    {
                        $set: {
                            "countData.$": data,
                        },
                    })
                resolve()
            } catch (error) {
                reject()
            }
        })
    },
    deleteCount(countId, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const deletedData = await Count.updateOne({ user }, { "$pull": { "countData": { "_id": new mongoose.Types.ObjectId(countId) } } }, { safe: true })
                if (deletedData.modifiedCount !== 0)
                    resolve()
                else reject()
            } catch (error) {
                reject()
            }
        })
    }
}