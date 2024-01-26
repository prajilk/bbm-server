const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

module.exports = {
    validateAdminDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                const admin = await Admin.findById(id);
                if (!admin) reject()
                resolve()
            } catch (error) {
                reject()
            }
        })
    },
    adminLogin: (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const admin = await Admin.findOne({ email: data.email });
                if (!admin) reject({
                    status: 401,
                    error: { success: false, message: "Invalid email or password" }
                })
                const passwordMatch = await bcrypt.compare(data.password, admin.password);

                if (passwordMatch) {
                    resolve({ email: admin.email, id: admin._id })
                } else {
                    reject({
                        status: 401,
                        error: { success: false, message: "Invalid email or password" }
                    })
                }
            } catch (error) {
                reject({
                    status: 500,
                    error: { success: false, message: "Something went wrong" }
                })
            }
        })
    },
}