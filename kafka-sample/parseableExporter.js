const { MetricExporter } = require('@opentelemetry/sdk-metrics-base');
const fetch = require('node-fetch');

class ParseableExporter extends MetricExporter {
    constructor(parseableUrl, authCredentials) {
        super();
        this.parseableUrl = parseableUrl;
        this.authCredentials = authCredentials;
    }

    export(metrics, resultCallback) {
        const body = JSON.stringify(metrics);
        fetch(this.parseableUrl, {
            method: 'POST',
            headers: {
                'Authorization': this.authCredentials,
                'Content-Type': 'application/json'
            },
            body: body
        })
        .then(response => resultCallback(response.status === 200 ? 0 : 1))
        .catch(() => resultCallback(1));
    }

    shutdown() {
        // Clean up tasks
    }
}
