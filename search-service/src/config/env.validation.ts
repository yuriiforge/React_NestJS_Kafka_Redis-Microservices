import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3005),
  ELASTICSEARCH_URL: Joi.string().default('http://elasticsearch:9200'),
});
