import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { OrderStatus } from '@ecommerce/shared/src/generated/prisma';
import prisma from '@ecommerce/shared/src/prisma';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { OrderCreatedEvent } from '@ecommerce/shared/src/events/order-created.event';
import { KafkaTopic } from '@ecommerce/shared/src/events/kafka-topics.enum';

@Injectable()
export class OrderService {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafka: ClientKafka,
  ) {}

  async findAll(userId: string, role: string, query: QueryOrderDto) {
    const { status, page = 1, limit = 20 } = query;

    const where = {
      ...(role !== 'ADMIN' && { userId }),
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

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (role !== 'ADMIN' && order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async create(dto: CreateOrderDto, userId: string) {
    const totalPrice = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        items: { create: dto.items },
      },
      include: { items: true },
    });

    const event: OrderCreatedEvent = {
      orderId: order.id,
      userId: order.userId,
      totalPrice: order.totalPrice,
      items: order.items,
      createdAt: order.createdAt,
    };

    this.kafka.emit(KafkaTopic.ORDER_CREATED, event);

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
