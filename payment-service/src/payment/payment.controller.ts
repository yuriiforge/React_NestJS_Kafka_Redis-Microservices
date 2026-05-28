import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { OrderCreatedEvent } from '@ecommerce/shared/src/events/order-created.event';
import { KafkaTopic } from '@ecommerce/shared/src/events/kafka-topics.enum';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern(KafkaTopic.ORDER_CREATED)
  async handleOrderCreated(@Payload() event: OrderCreatedEvent) {
    await this.paymentService.processPayment(event);
  }
}
