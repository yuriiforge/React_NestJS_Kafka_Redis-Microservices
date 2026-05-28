import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'order-service',
              brokers: config.get<string>('KAFKA_BROKERS', 'kafka:9092').split(','),
            },
            producer: {
              allowAutoTopicCreation: false,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
