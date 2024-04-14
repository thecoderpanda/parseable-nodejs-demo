const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const os = require('os');
const fetch = require('node-fetch');

// Parseable URL and credentials
const parseableUrl = 'http://localhost:8000/api/v1/logstream/oteltest';
const authCredentials = 'Basic YWRtaW46YWRtaW4='; // Replace with actual credentials

const meterProvider = new MeterProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'node-otel-parseable',
    }),
});

const meter = meterProvider.getMeter('system-metrics');

const memoryUsage = meter.createObservableGauge('memory_usage', {
    description: 'Memory usage of the system',
});

console.log('Meter Provider:', meter);
console.log('Memory Usage Gauge:', memoryUsage);

memoryUsage.addCallback((observableResult) => {
    const metrics = collectSystemMetrics();
    console.log('Collecting Metrics:', metrics);
    observableResult.observe(metrics.totalMem - metrics.freeMem, { state: 'used' });
    observableResult.observe(metrics.freeMem, { state: 'free' });
});

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

function sendMetrics() {
    const metrics = collectSystemMetrics();
    console.log('Sending Metrics:', metrics);
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
            console.log('Metrics successfully ingested.')
        })
        .catch(error => {
            console.log('Error sending metrics:', error.message);
        });
}

// Set the interval to send metrics every 2 seconds
setInterval(sendMetrics, 2000);
