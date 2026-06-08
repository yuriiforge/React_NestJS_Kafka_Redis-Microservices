import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { DeliveryService } from './delivery.service';
import { PaymentCompletedEvent, KafkaTopic } from '@ecommerce/shared';

@Controller()
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @EventPattern(KafkaTopic.PAYMENT_COMPLETED)
  async handlePaymentCompleted(@Payload() event: PaymentCompletedEvent) {
    await this.deliveryService.assignDelivery(event);
  }
}
