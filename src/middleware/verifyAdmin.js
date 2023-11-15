const { validateAdminDetails } = require("../controllers/AdminController");

async function verifyAdmin(req, res, next) {
    const adminCookie = req.cookies.admin || "";
    const decodedAdmin = JSON.parse(
        atob(adminCookie) === "" ? "{}" : atob(adminCookie)
    );
    if (Object.keys(decodedAdmin).length !== 0 && decodedAdmin.email) {
        validateAdminDetails(decodedAdmin.id)
            .then(() => { next() })
            .catch(() => {
                res.status(401).json({ adminVerified: false })
            })
    }
    else res.status(401).json({ adminVerified: false })
}
module.exports = verifyAdmin;