const express = require('express');
const cors = require("cors");
const axios = require('axios');
const bypassLink = require("./fluxus");

const app = express();
app.use(cors());
app.use(express.json()); // Middleware untuk parsing JSON

// Home route
app.get("/", (req, res) => {
    res.json({ message: "Invalid Endpoint" });
});

// Fluxus API route
app.post("/api/fluxus", async (req, res) => {
    const url = req.body.url;
    const hcaptchaResponse = req.body['h-captcha-response']; // Ambil token hCaptcha

    // Verifikasi hCaptcha
    const secretKey = 'ES_c9d9cc0e0f8a467c99480012beff3b79'; // Ganti dengan kunci rahasia Anda
    const verificationUrl = `https://hcaptcha.com/siteverify?secret=${secretKey}&response=${hcaptchaResponse}`;

    try {
        const verificationResponse = await axios.post(verificationUrl);
        const verificationData = verificationResponse.data;

        if (!verificationData.success) {
            return res.status(400).json({ message: "hCaptcha verification failed." });
        }

        // Cek URL
        if (url && url.startsWith("https://flux.li/android/external/start.php?HWID=")) {
            const { key, timeTaken } = await bypassLink(url);
            return res.json({ key, time_taken: timeTaken, credit: "myuko" });
        } else {
            return res.status(400).json({ message: "Please Enter a Valid Fluxus Link!" });
        }
    } catch (error) {
        console.error("Error during hCaptcha verification:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
