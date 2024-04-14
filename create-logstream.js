const fetch = require('node-fetch'); // Make sure node-fetch is installed

// Initialize headers with basic authentication
var myHeaders = new fetch.Headers();
myHeaders.append("Authorization", "Basic YWRtaW46YWRtaW4="); // Replace with your actual encoded credentials

// Configure the request options for creating a log stream
var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    redirect: 'follow'
};

// Replace 'http://localhost:8000' with your actual Parseable URL
fetch("http://localhost:8000/api/v1/logstream/oteltest", requestOptions)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error, status = ${response.status}`);
        }
        return response.text();
    })
    .then(result => console.log('Log stream created successfully:', result))
    .catch(error => console.log('Error creating log stream:', error));
