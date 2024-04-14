const fetch = require('node-fetch');
const { MeterProvider, PeriodicExportingMetricReader, UnitUtils } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

class ParseableMetricExporter {
  constructor(url, credentials) {
    this.url = url;
    this.credentials = credentials;
    this.meterProvider = new MeterProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'my-service',
      }),
    });
    this.meter = this.meterProvider.getMeter('my-meter');
  }

  async export(resultCallback) {
    const reader = new PeriodicExportingMetricReader({
      exporter: this,
      exportIntervalMillis: 10000, // 10 seconds
    });

    reader.start();

    // Here you can define and record your metrics
    const counter = this.meter.createCounter('my_counter', {
      description: 'A simple counter metric',
      unit: UnitUtils.UNIT_NONE,
    });

    counter.add(1, { 'key': 'value' });

    // The export method will be called by the PeriodicExportingMetricReader
    await this.export(metrics, resultCallback);
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
      console.log('Sending metrics...');
      const response = await fetch(this.url, {
        method: 'POST',
        headers: headers,
        body: body,
      });
  
      if (response.ok) {
        console.log('Metrics sent successfully');
        resultCallback({ code: 0 });
      } else {
        console.error(`Failed to export metrics, status: ${response.status}`);
        resultCallback({ code: 1, error: new Error(`Failed to export metrics, status: ${response.status}`) });
      }
    } catch (error) {
      console.error('Error exporting metrics:', error);
      resultCallback({ code: 1, error });
    }
  }
}

module.exports = { ParseableMetricExporter };