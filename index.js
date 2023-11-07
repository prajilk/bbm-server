const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const { validateUser, registerUser, userLogin } = require('./src/controllers/UserController.js');
const { saveCounts, getCounts } = require('./src/controllers/CountsController.js');
const { default: axios } = require('axios');
const PORT = 5000;

//Connect to database
require('./src/config/db.js');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:3000", "https://bigbutterflymonth.vercel.app"], credentials: true }));

app.get('/', (req, res) => {
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
        .catch(() => res.status(500).json({ registered: false }))
})

app.post("/api/butterfly-count", (req, res) => {
    const data = req.body;
    if (!data) res.status(400).json({ countSaved: false })
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
})

app.listen(PORT, console.log(`Server running on Port: ${PORT}`));