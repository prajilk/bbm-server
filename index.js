const express = require('express');
const cors = require('cors');
const serverless = require("serverless-http")
const cookieParser = require('cookie-parser');
require('dotenv').config()
const { validateUser, registerUser, userLogin, getAllUsers } = require('./src/controllers/UserController.js');
const { saveCounts, getCounts, getAllCounts, deleteCount, getUserCounts, getCount, updateCount } = require('./src/controllers/CountsController.js');
const verifyAdmin = require('./src/middleware/verifyAdmin.js')
const { default: axios } = require('axios');
const { adminLogin } = require('./src/controllers/AdminController.js');
const { syncData, getAllButterflies, deleteButterfly, updateButterfly, addButterfly } = require('./src/controllers/ButterflyController.js');
// const PORT = 5000;

//Connect to database
require('./src/config/db.js');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:3000", "https://bigbutterflymonth.vercel.app", "http://chitte.org", "https://chitte.org"], credentials: true }));

app.get('/test', (req, res) => {
    res.send('Server created successfully!');
})

app.get('/elevation', async (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }
    try {
        const elevationURL = `https://api.open-meteo.com/v1/elevation?latitude=${latitude}&longitude=${longitude}`;
        const { data } = await axios.get(elevationURL);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post("/api/user/login", async (req, res) => {
    const data = req.body;
    if (!data) res.status(400).json({ success: false })

    userLogin(data)
        .then((user) => res.status(200).json({ success: true, user: user }))
        .catch((error) => res.status(error.status).json(error.error))
})

app.post("/api/user/validate-user", async (req, res) => {
    const data = req.body;
    if (!data) res.status(400).json({ userVerified: false })
    const email = data.email;

    validateUser(email)
        .then(() => res.status(200).json({ userVerified: true }))
        .catch(() => res.status(401).json({ userVerified: false }))
})

app.post("/api/user/register", async (req, res) => {
    const data = req.body;
    if (!data) res.status(400).json({ registered: false })
    const email = data.email;
    const fullname = data.fullname
    const password = data.password

    registerUser(email, fullname, password)
        .then((id) => res.status(200).json({ id: id, registered: true }))
        .catch((err) => {
            if (err && err.status === 409)
                return res.status(409).json({ registered: false, message: 'Email already exists!' })
            return res.status(500).json({ registered: false })
        })
})

app.post("/api/butterfly-count", (req, res) => {
    const data = req.body;
    if (!data) return res.status(400).json({ countSaved: false })
    saveCounts(data)
        .then(() => res.status(200).json({ countSaved: true }))
        .catch(() => res.status(500).json({ countSaved: false }))
})

app.get("/api/butterfly-count", (req, res) => {
    const userCookie = req.cookies.user || "";
    if (userCookie !== "") {
        const decodedUser = JSON.parse(atob(userCookie));
        getCounts(decodedUser.id)
            .then((countData) => res.status(200).json({ countData }))
            .catch(() => res.status(500).json({ countData: [] }))
    } else {
        res.status(401).json({ countData: [], user: false })
    }
});


app.post("/api/admin/login", (req, res) => {
    const data = req.body;
    if (!data) res.status(400).json({ success: false })

    adminLogin(data)
        .then((admin) => res.status(200).json({ success: true, user: admin }))
        .catch((error) => res.status(error.status).json(error.error))
})

app.get('/api/admin/count/:countId/:user', verifyAdmin, (req, res) => {
    const countId = req.params.countId;
    const user = req.params.user;
    if (!countId || !user) return res.status(400).json({ count: null })
    getCount(countId, user)
        .then((countData) => {
            return res.status(200).json({ count: countData })
        })
        .catch(() => res.status(500).json({ count: null }))
})

app.put('/api/admin/count/:countId/:user', (req, res) => {
    const countId = req.params.countId;
    const user = req.params.user;
    const data = req.body;
    if (!countId || !user) return res.status(400).json({ updated: false })
    updateCount(countId, user, data)
        .then(() => {
            return res.status(200).json({ updated: true })
        })
        .catch(() => res.status(500).json({ updated: false }))
})

app.get('/api/admin/counts', verifyAdmin, (req, res) => {
    getAllCounts()
        .then((countData) => res.status(200).json({ counts: countData }))
        .catch(() => res.status(500).json({ counts: [] }))
})

app.get('/api/admin/counts/:user', verifyAdmin, (req, res) => {
    const userId = req.params.user;
    if (!userId) return res.status(400).json({ counts: [], user: null })
    getUserCounts(userId)
        .then((countData) => res.status(200).json({ counts: countData.counts, user: countData.user }))
        .catch(() => res.status(500).json({ counts: [], user: null }))
})

app.delete('/api/admin/counts/:id/:user', (req, res) => {
    deleteCount(req.params.id, req.params.user)
        .then(() => res.status(200).json({ deleted: true }))
        .catch(() => res.status(500).json({ deleted: false }))
})

app.get('/api/admin/users', verifyAdmin, (req, res) => {
    getAllUsers()
        .then((users) => res.status(200).json({ users }))
        .catch(() => res.status(500).json({ users: [] }))
})

app.get('/api/butterflies/sync/:date', (req, res) => {
    const lastSyncDate = req.params.date;

    syncData(lastSyncDate)
        .then((response) => res.status(200).json(response))
        .catch((error) => res.status(500).json(error));
});

app.get('/api/admin/butterflies', verifyAdmin, (req, res) => {
    getAllButterflies()
        .then(response => res.status(200).json({ butterflies: response.butterflies }))
        .catch(() => res.status(500).json({ butterflies: null }))
})

app.post('/api/admin/butterflies', (req, res) => {
    const data = req.body;
    if (!data) return res.status(400).json({ error: true })
    addButterfly(data)
        .then((id) => res.status(200).json({ error: false, id }))
        .catch(() => res.status(500).json({ error: true }))
})

app.delete('/api/admin/butterflies/:id', (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: true })
    deleteButterfly(id)
        .then(() => res.status(200).json({ error: false }))
        .catch(() => res.status(500).json({ error: true }))
})
app.patch('/api/admin/butterflies/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body
    if (!id || !data) return res.status(400).json({ error: true })

    updateButterfly(req.params.id, data)
        .then(() => res.status(200).json({ error: false }))
        .catch(() => res.status(500).json({ error: true }))
})

// app.listen(PORT, console.log(`Server running on Port: ${PORT}`));

module.exports.handler = serverless(app);