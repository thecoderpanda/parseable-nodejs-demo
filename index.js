const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'dummy.log');

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
      sendLogToParseable(message); // Call to send the log to Parseable
    }
  });
}

// Function to send log message to Parseable
function sendLogToParseable(logMessage) {
  const myHeaders = new Headers();
  myHeaders.append("X-P-META-Host", "192.168.1.3");
  myHeaders.append("X-P-TAG-Language", "javascript");
  myHeaders.append("Authorization", "Basic YWRtaW46YWRtaW4="); // Replace with your Parseable credentials
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify([{
    "message": logMessage, // Use the log message here
    "datetime": new Date().toISOString(),
  }]);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  // Replace <parseable-url> and <stream-name> with your actual Parseable URL and stream name
  fetch("http://localhost:8000/api/v1/logstream/demoapp", requestOptions)
    .then(response => response.text())
    .then(result => console.log('Log sent to Parseable:', result))
    .catch(error => console.log('error sending log to Parseable:', error));
}

const intervalMs = 5000;
setInterval(appendLogMessage, intervalMs);
