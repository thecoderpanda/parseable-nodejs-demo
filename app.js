const os = require('os');
const fetch = require('node-fetch');
const express = require('express');
const app = express();
const port = 3000;

// Parseable URL and credentials
const parseableUrl = 'http://localhost:8000/api/v1/logstream/testapplogs';
const authCredentials = 'Basic YWRtaW46YWRtaW4='; // Replace with actual credentials

function collectSystemMetrics() {
    return {
        datetime: new Date().toISOString(),
        host: os.hostname(),
        platform: os.platform(),
        type: os.type(),
        release: os.release(),
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        cpuCount: os.cpus().length,
        loadavg: os.loadavg(),
    };
}

function sendMetrics(isError = false) {
    const metrics = collectSystemMetrics();
    metrics.status = isError ? 'error' : 'success';
    console.log(`Sending ${metrics.status} Metrics:`, metrics);
    const headers = new fetch.Headers({
        "Authorization": authCredentials,
        "Content-Type": "application/json",
        "X-P-META-Host": metrics.host,
        "X-P-TAG-Language": "javascript",
        "X-P-TAG-Platform": metrics.platform,
        "X-P-SOURCE": "OTEL"
    });

    const body = JSON.stringify([metrics]);

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: body,
        redirect: 'follow'
    };

    fetch(parseableUrl, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error, status = ${response.status}`);
            }
            return response.text();
        })
        .then(result => {
            console.log(`Metrics successfully ingested. Status: ${metrics.status}`);
        })
        .catch(error => {
            console.log('Error sending metrics:', error.message);
        });
}

// Set the interval to send success metrics every 3 seconds
setInterval(() => sendMetrics(), 3000);

// Endpoint to generate success log
app.get('/generate-success', (req, res) => {
    sendMetrics();
    res.send('Success log generated');
});

// Endpoint to generate error log
app.get('/generate-error', (req, res) => {
    sendMetrics(true);
    res.send('Error log generated');
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
