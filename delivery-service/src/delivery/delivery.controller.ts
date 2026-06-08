import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@ecommerce/shared';
import { DeliveryService } from './delivery.service';

@ApiTags('deliveries')
@ApiBearerAuth()
@Controller('deliveries')
@UseGuards(AuthGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get(':orderId')
  @ApiOperation({ summary: 'Get delivery status for an order' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  @ApiResponse({ status: 200, description: 'Delivery details' })
  findByOrderId(@Param('orderId') orderId: string) {
    return this.deliveryService.findByOrderId(orderId);
  }
}
