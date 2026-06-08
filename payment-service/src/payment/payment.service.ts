import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { PaymentStatus, prisma, OrderCreatedEvent, PaymentCompletedEvent, KafkaTopic } from '@ecommerce/shared';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafka: ClientKafka,
  ) {}

  async processPayment(event: OrderCreatedEvent) {
    this.logger.log(`Processing payment for order ${event.orderId}`);

    const payment = await prisma.payment.create({
      data: {
        orderId: event.orderId,
        userId: event.userId,
        amount: event.totalPrice,
        status: PaymentStatus.PENDING,
      },
    });

    // Simulate payment processing
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.COMPLETED },
    });

    const completedEvent: PaymentCompletedEvent = {
      orderId: event.orderId,
      userId: event.userId,
      totalPrice: event.totalPrice,
      paidAt: new Date(),
    };

    this.kafka.emit(KafkaTopic.PAYMENT_COMPLETED, completedEvent);

    this.logger.log(`Payment completed for order ${event.orderId}`);
  }
}
