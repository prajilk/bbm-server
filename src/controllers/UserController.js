const bcrypt = require("bcrypt")
const User = require('../models/User');

module.exports = {
    registerUser: (email, fullname, password) => {
        return new Promise(async (resolve, reject) => {
            try {
                const passwordHash = await bcrypt.hash(password, 10);
                const user = await User.create({ email, fullname, password: passwordHash })
                if (!user) reject()
                else resolve(user._id)
            } catch (error) {
                reject()
            }
        })
    },
    userLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findOne({ email: data.email });
                if (!user) reject({
                    status: 401,
                    error: { success: false, message: "Invalid email or password" }
                })
                const passwordMatch = await bcrypt.compare(data.password, user.password);
                if (passwordMatch) {
                    resolve({ email: user.email, fullname: user.fullname, id: user._id })
                } else {
                    reject({
                        status: 401,
                        error: { success: false, message: "Invalid email or password" }
                    })
                }
            } catch (error) {
                console.log(error);
                reject({
                    status: 500,
                    error: { success: false, message: "Something went wrong" }
                })
            }
        })
    },
    validateUser: (email) => {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findOne({ email })
                if (!user) reject()
                else resolve()
            } catch (error) {
                reject()
            }
        })
    }
}