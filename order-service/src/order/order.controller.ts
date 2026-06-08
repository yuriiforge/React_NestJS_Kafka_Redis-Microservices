import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Headers } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { AuthGuard } from '@ecommerce/shared';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  findAll(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
    @Query() query: QueryOrderDto,
  ) {
    return this.orderService.findAll(userId, role, query);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.orderService.findOne(id, userId, role);
  }

  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.create(dto, userId);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.orderService.cancel(id, userId, role);
  }
}
