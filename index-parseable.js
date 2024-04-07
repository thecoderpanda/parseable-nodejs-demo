var myHeaders = new Headers(); const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'dummy.log');

// TODO: Replace the basic auth credentials with your Parseable credentials
myHeaders.append("Authorization", "Basic YWRtaW46YWRtaW4=");

var requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    redirect: 'follow'
};
// TODO: Replace the url with your Parseable URL and stream name
fetch("https://<parseable-url>/api/v1/logstream/<stream-name>", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

function generateLogMessage() {
    const timestamp = new Date().toISOString();
    const message = `Log entry at ${timestamp}: This is a dummy log message.`;
    return message;
}
function appendLogMessage() {
    const message = generateLogMessage() + '\n';
    fs.appendFile(logFilePath, message, (err) => {
        if (err) {
            console.error('Error appending to log file:', err);
        } else {
            console.log('Log message added:', message.trim());
        }
    });
}
const intervalMs = 5000;
setInterval(appendLogMessage, intervalMs);