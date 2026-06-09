import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { AnalyticsModule } from './analytics/analytics.module';
import { MetricsModule } from '@ecommerce/shared';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true },
    }),
    AnalyticsModule,
    MetricsModule,
  ],
})
export class AppModule {}
