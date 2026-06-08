import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaTopic } from '../events/kafka-topics.enum';

const kafka = new Kafka({
  clientId: 'ecommerce',
  brokers: [(process.env.KAFKA_BROKER ?? 'kafka:9092')],
});

export async function createProducer(): Promise<Producer> {
  const producer = kafka.producer();
  await producer.connect();
  return producer;
}

export async function createConsumer(
  groupId: string,
  topics: string[],
  handler: (payload: EachMessagePayload) => Promise<void>,
): Promise<Consumer> {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }
  await consumer.run({ eachMessage: handler });
  return consumer;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

export async function publishToDLQ(
  producer: Producer,
  originalMessage: unknown,
  error: unknown,
  retryCount: number,
): Promise<void> {
  await producer.send({
    topic: KafkaTopic.ORDERS_DLQ,
    messages: [
      {
        value: JSON.stringify({
          originalMessage,
          error: error instanceof Error ? error.message : String(error),
          retryCount,
          failedAt: new Date().toISOString(),
        }),
      },
    ],
  });
}
