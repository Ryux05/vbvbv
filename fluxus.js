const axios = require('axios');
const cheerio = require('cheerio');
const keyRegex = /let content = \("([^"]+)"\);/;

async function fetch(url, headers) {
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch URL: ${url}. Error: ${error.message}`);
    }
}   

async function bypassLink(url) {
    try {
        const hwid = url.split("HWID=")[1];
        if (!hwid) {
            throw new Error("Invalid HWID in URL");
        }

        const startTime = Date.now();
        const endpoints = [
            {
                url: `https://flux.li/android/external/start.php?HWID=${hwid}`,
                referer: ""
            },
            {
                url: "https://flux.li/android/external/check1.php?hash={hash}",
                referer: "https://linkvertise.com"
            },
            {
                url: "https://flux.li/android/external/main.php?hash={hash}",
                referer: "https://linkvertise.com"
            }
        ];

        for (let i = 0; i < endpoints.length; i++) {
            const endpoint = endpoints[i];
            const headers = {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'DNT': '1',
                'Connection': 'close',
                'Referer': endpoint.referer,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
            };

            const responseText = await fetch(endpoint.url, headers);

            if (i === endpoints.length - 1) {
                const match = responseText.match(keyRegex);
                if (match) {
                    const endTime = Date.now();
                    const timeTaken = (endTime - startTime) / 1000; // time in seconds
                    return { key: match[1], timeTaken };
                } else {
                    throw new Error("Failed to find content key");
                }
            }
        }
    } catch (error) {
        throw new Error(`Failed to bypass link. Error: ${error.message}`);
    }
}

module.exports = bypassLink;
