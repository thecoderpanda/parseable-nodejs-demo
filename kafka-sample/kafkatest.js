'use strict';
const { Kafka } = require('kafkajs');
const tracer = require('./tracing');
const { sendLogToParseable } = require('./tracing');  // Include the log sending function
const { context, trace } = require('@opentelemetry/api');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']  // Update if your broker's address is different
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'test-group' });

const topics = ['topic1', 'topic2', 'topic3'];  // Example topics

const run = async () => {
  await producer.connect();
  await consumer.connect();

  // Subscribe consumer to all topics
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }

  // Consumer to log messages and send logs to Parseable
  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value.toString()} on topic: ${topic}`);

      const currentSpan = trace.getSpan(context.active());
      const traceContext = currentSpan ? {
        traceId: currentSpan.context().traceId,
        spanId: currentSpan.context().spanId
      } : { traceId: 'unknown', spanId: 'unknown' };

      sendLogToParseable({
        message: message.value.toString(),
        topic,
        partition
      }, traceContext);  // Enhanced logging with message details and tracing info
    },
  });

  // Function to send random messages to random topics at random intervals between 2 and 3 seconds
  const sendMessageRandomly = async () => {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const value = `Random message ${Math.random()}`;

    console.log(`Sending message: ${value} to topic: ${topic}`);
    await producer.send({
      topic: topic,
      messages: [{ value: value }],
    });

    const currentSpan = trace.getSpan(context.active());
    const traceContext = currentSpan ? {
      traceId: currentSpan.context().traceId,
      spanId: currentSpan.context().spanId
    } : { traceId: 'unknown', spanId: 'unknown' };

    sendLogToParseable({
      message: value,
      topic,
      partition: null  // Sending does not have a partition context
    }, traceContext);  // Enhanced logging with message details and tracing info

    // Schedule the next message
    setTimeout(sendMessageRandomly, Math.random() * 1000 + 2000); // Random time between 2000ms (2 seconds) and 3000ms (3 seconds)
  };

  // Start sending messages
  sendMessageRandomly();
};

run().catch(console.error);
