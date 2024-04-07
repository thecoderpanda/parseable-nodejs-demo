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
    }
  });
}
const intervalMs = 5000;
setInterval(appendLogMessage, intervalMs);
