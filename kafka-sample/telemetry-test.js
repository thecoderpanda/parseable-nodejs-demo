const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

const parseableUrl = 'http://localhost:8000/api/v1/logstream/oteltest';
const authCredentials = 'Basic YWRtaW46YWRtaW4='; // Replace with actual credentials

const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'example-service',
  }),
  interval: 5000, // Export metrics every 5 seconds
});

const meter = meterProvider.getMeter('example-meter');

const cpuUsage = meter.createObservableGauge('cpu_usage', {
    description: 'Tracks the CPU usage',
  });
  
  cpuUsage.addCallback((observableResult) => {
    const load = process.cpuUsage();
    observableResult.observe(load.user + load.system, { pid: process.pid });
  });

  class ParseableMetricExporter {
    constructor(url, credentials) {
      this.url = url;
      this.credentials = credentials;
    }
  
    async export(metrics, resultCallback) {
      const headers = {
        "Authorization": this.credentials,
        "Content-Type": "application/json",
      };
  
      const body = JSON.stringify(metrics.map(metric => ({
        datetime: new Date().toISOString(),
        name: metric.descriptor.name,
        description: metric.descriptor.description,
        value: metric.aggregator.toPoint().value,
      })));
  
      try {
        const response = await fetch(this.url, {
          method: 'POST',
          headers: headers,
          body: body,
        });
  
        if (response.ok) {
          resultCallback({ code: 0 });
        } else {
          resultCallback({ code: 1, error: new Error(`Failed to export metrics, status: ${response.status}`) });
        }
      } catch (error) {
        resultCallback({ code: 1, error });
      }
    }
  }
  
  const exporter = new ParseableMetricExporter(parseableUrl, authCredentials);
  
  const reader = new PeriodicExportingMetricReader({
    exporter: exporter,
    exportIntervalMillis: 5000, // Export metrics every 5 seconds
  });
  
  meterProvider.addMetricReader(reader);

  console.log('Sending metrics to Parseable...');

meterProvider.start();

console.log('Metrics are being sent to Parseable every 5 seconds.');