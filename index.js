const express = require('express');
const app = express();
const cors = require("cors");
const bypassLink = require("./fluxus")
app.use(cors()); // Enable CORS for all routes
app.get("/", (req, res) => {
    res.json({ message: "Invalid Endpoint" });
});
app.get("/api/fluxus", async (req, res) => {
    const url = req.query.url;
    if (url && url.startsWith("https://flux.li/android/external/start.php?HWID=")) {
        try {
            const { key, timeTaken } = await bypassLink(url);
            return res.json({ key, time_taken: timeTaken, credit: "myuko" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        return res.json({ message: "Please Enter Fluxus Link!" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
