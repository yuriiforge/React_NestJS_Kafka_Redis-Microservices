import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MetricsModule } from '@ecommerce/shared';

@Module({
  controllers: [AppController],
  imports: [MetricsModule],
})
export class AppModule {}
