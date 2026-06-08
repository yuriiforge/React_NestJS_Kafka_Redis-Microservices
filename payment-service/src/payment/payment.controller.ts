import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';
import { OrderCreatedEvent, KafkaTopic } from '@ecommerce/shared';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern(KafkaTopic.ORDER_CREATED)
  async handleOrderCreated(@Payload() event: OrderCreatedEvent) {
    await this.paymentService.processPayment(event);
  }
}
