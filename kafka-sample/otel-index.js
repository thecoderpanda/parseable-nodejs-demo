const net = require('net');

const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { Resource } = require('@opentelemetry/resources');
const { SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');

const grpc = require('@grpc/grpc-js');

// Configure diagnostics for OpenTelemetry
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

// Define the resource associated with the service
const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: 'example-service',
});

// Tracer provider for collecting traces
const traceProvider = new NodeTracerProvider({ resource });
const traceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4317',
  credentials: grpc.credentials.createInsecure(),
});
traceProvider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
traceProvider.register();

// Function to generate and send logs
function generateAndSendLogs() {
  console.log('Log entry: This is a dummy log message with timestamp:', Date.now());
  setTimeout(generateAndSendLogs, 5000);
}

// Start generating logs
generateAndSendLogs();

// Function to check connectivity to gRPC URL
function checkGrpcConnection(host, port) {
  const client = net.createConnection({ host, port }, () => {
    console.log(`Connection to ${host}:${port} successful.`);
    client.end();
  });

  client.on('error', (err) => {
    console.error(`Connection to ${host}:${port} failed:`, err.message);
  });
}

// Perform a connection check to the Parseable gRPC URL
checkGrpcConnection('localhost', 8001);
