import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { AuthGuard } from '@ecommerce/shared';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'List orders (own orders for users, all for admins)' })
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Injected by gateway' })
  @ApiHeader({ name: 'x-user-role', required: false, description: 'Injected by gateway' })
  @ApiResponse({ status: 200, description: 'Paginated order list' })
  findAll(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
    @Query() query: QueryOrderDto,
  ) {
    return this.orderService.findAll(userId, role, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.orderService.findOne(id, userId, role);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Created order' })
  create(
    @Body() dto: CreateOrderDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.create(dto, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  cancel(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.orderService.cancel(id, userId, role);
  }
}
