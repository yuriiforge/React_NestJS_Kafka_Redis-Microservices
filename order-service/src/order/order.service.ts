import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Subject } from 'rxjs';
import { Consumer, Producer } from 'kafkajs';
import {
  OrderStatus,
  Role,
  prisma,
  KafkaTopic,
  KafkaGroup,
  OrderCreatedEvent,
  OrderStatusUpdatedEvent,
  OrderDeliveryStatus,
  createProducer,
  createConsumer,
} from '@ecommerce/shared';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

const STATUS_MAP: Record<OrderDeliveryStatus, OrderStatus> = {
  [OrderDeliveryStatus.PREPARING]: OrderStatus.CONFIRMED,
  [OrderDeliveryStatus.SHIPPED]: OrderStatus.SHIPPED,
  [OrderDeliveryStatus.DELIVERED]: OrderStatus.DELIVERED,
};

@Injectable()
export class OrderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrderService.name);
  private producer!: Producer;
  private consumer!: Consumer;
  private readonly subjects = new Map<
    string,
    Subject<OrderStatusUpdatedEvent>
  >();

  async onModuleInit() {
    this.producer = await createProducer();
    this.consumer = await createConsumer(
      KafkaGroup.ORDER_SERVICE_STATUS,
      [KafkaTopic.ORDER_STATUS_UPDATED],
      async ({ message }) => {
        const event: OrderStatusUpdatedEvent = JSON.parse(
          message.value!.toString(),
        );
        await this.handleStatusUpdate(event);
      },
    );
    this.logger.log('Kafka ready');
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
    await this.consumer?.disconnect();
  }

  private async handleStatusUpdate(event: OrderStatusUpdatedEvent) {
    const newStatus = STATUS_MAP[event.status];

    await prisma.order.update({
      where: { id: event.orderId },
      data: { status: newStatus },
    });

    const sub = this.subjects.get(event.orderId);
    sub?.next(event);

    if (event.status === OrderDeliveryStatus.DELIVERED) {
      sub?.complete();
      this.subjects.delete(event.orderId);
    }
  }

  getOrderSubject(orderId: string): Subject<OrderStatusUpdatedEvent> {
    if (!this.subjects.has(orderId)) {
      this.subjects.set(orderId, new Subject());
    }
    return this.subjects.get(orderId)!;
  }

  async findAll(userId: string, role: string, query: QueryOrderDto) {
    const { status, page = 1, limit = 20 } = query;
    const where = {
      ...(role !== Role.ADMIN && { userId }),
      ...(status && { status }),
    };
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (role !== Role.ADMIN && order.userId !== userId)
      throw new ForbiddenException('Access denied');
    return order;
  }

  async create(dto: CreateOrderDto, userId: string) {
    const totalPrice = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const order = await prisma.order.create({
      data: { userId, totalPrice, items: { create: dto.items } },
      include: { items: true },
    });

    const event: OrderCreatedEvent = {
      orderId: order.id,
      userId: order.userId,
      totalAmount: order.totalPrice,
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      createdAt: order.createdAt.toISOString(),
    };

    await this.producer.send({
      topic: KafkaTopic.ORDERS,
      messages: [{ key: order.id, value: JSON.stringify(event) }],
    });

    return order;
  }

  async cancel(id: string, userId: string, role: string) {
    const order = await this.findOne(id, userId, role);
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }
    return await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
      include: { items: true },
    });
  }
}
