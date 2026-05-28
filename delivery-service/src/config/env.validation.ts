import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3003),
  DATABASE_URL: Joi.string().required(),
  KAFKA_BROKERS: Joi.string().default('kafka:9092'),
});
