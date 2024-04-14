'use strict';
const os = require('os');
const process = require('process');
const opentelemetry = require('@opentelemetry/api');
const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const sdkNode = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const http = require('http');

// Configure trace exporter
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:8000/api/v1/logstream/otel'
});

// Configure metrics exporter
const metricExporter = new OTLPMetricExporter({
  url: 'http://localhost:8000/api/v1/metrics'
});

// Set up resource information for telemetry data
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'otel-app',
  [SemanticResourceAttributes.HOST_NAME]: os.hostname()
});

// Initialize SDK for tracing
const sdk = new sdkNode.NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  resource
});

// Initialize MeterProvider for metrics
const meterProvider = new MeterProvider({
  exporter: metricExporter,
  interval: 5000,
  resource
});

const meter = meterProvider.getMeter('system-metrics');

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => {
      console.log('Tracing and Metrics collection terminated');
      meterProvider.shutdown().then(() => {
        console.log('Metrics collection terminated');
      });
    })
    .catch((error) => console.error('Error terminating tracing and metrics', error))
    .finally(() => process.exit(0));
});

function sendLogToParseable(kafkaMessage, traceContext) {
  const traceId = traceContext?.traceId || 'unknown';
  const spanId = traceContext?.spanId || 'unknown';
  const data = JSON.stringify({
    "id": "434a5f5e-2f5f-11ed-a261-asdasdafgdfd",
    "datetime": new Date().toISOString(),
    "host": os.hostname(),
    "user-identifier": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:64.0) Gecko/20100101 Firefox/64.0",
    "method": "PUT",
    "status": 500,
    "referrer": "http://localhost",
    "traceId": traceId,
    "spanId": spanId,
    "kafkaMessage": kafkaMessage
  });

  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/logstream/otel',
    method: 'POST',
    headers: {
      "Authorization": "Basic YWRtaW46YWRtaW4=",
      "Content-Type": "application/json",
      "X-P-META-Host": "192.168.1.3",
      "X-P-TAG-Language": "javascript",
      "X-P-SOURCE": "OTEL"
    }
  };

  const req = http.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

module.exports = { sendLogToParseable };
