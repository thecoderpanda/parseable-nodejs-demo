const os = require('os');
const fetch = require('node-fetch');

// Configuration
const parseableUrl = 'http://localhost:8000/api/v1/logstream/oteltest';
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

function sendMetrics(metrics) {
    const headers = new Headers({
        "Authorization": authCredentials,
        "Content-Type": "application/json",
        "X-P-META-Host": metrics.host,
        "X-P-TAG-Language": "javascript",
        "X-P-TAG-Platform": metrics.platform
    });

    const body = JSON.stringify([metrics]);

    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: body,
        redirect: 'follow'
    };

    fetch(parseableUrl, requestOptions)
        .then(response => response.text())
        .then(result => console.log('Response from Parseable:', result))
        .catch(error => console.log('Error sending metrics:', error));
}

function generateAndSendMetrics() {
    const metrics = collectSystemMetrics();
    console.log('Collected Metrics:', metrics);
    sendMetrics(metrics);
}

// Generate and send metrics every 30 seconds
setInterval(generateAndSendMetrics, 500);
