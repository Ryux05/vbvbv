const express = require('express');
const cors = require("cors");
const axios = require('axios');
const bypassLink = require("./fluxus");

const app = express();
app.use(cors());
app.use(express.json()); // Middleware untuk parsing JSON

const HCAPTCHA_SECRET = 'ES_c9d9cc0e0f8a467c99480012beff3b79'; // Replace with your hCaptcha secret key

// Home route
app.get("/", (req, res) => {
    res.json({ message: "Invalid Endpoint" });
});

// Fluxus API route
app.post("/api/fluxus", async (req, res) => {
    const url = req.body.url;
    const captchaResponse = req.body.captcha; // Get captcha response from the request

    try {
        // Validate captcha response
        const captchaValidationResponse = await axios.post(`https://hcaptcha.com/siteverify`, null, {
            params: {
                secret: HCAPTCHA_SECRET,
                response: captchaResponse
            }
        });

        // Check if the captcha was successful
        if (!captchaValidationResponse.data.success) {
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
