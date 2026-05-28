import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3004),
  KAFKA_BROKERS: Joi.string().default('kafka:9092'),
  ELASTICSEARCH_URL: Joi.string().uri().default('http://elasticsearch:9200'),
});
