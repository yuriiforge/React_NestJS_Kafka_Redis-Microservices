import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3007),
  DATABASE_URL: Joi.string().required(),
});
