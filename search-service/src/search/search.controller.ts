import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard, AdminGuard } from '@ecommerce/shared';
import { SearchService } from './search.service';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
@UseGuards(AuthGuard, AdminGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Aggregated order stats from Elasticsearch' })
  @ApiResponse({ status: 200, description: 'ES aggregations' })
  getStats() {
    return this.searchService.getStats();
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get single order document from Elasticsearch' })
  @ApiResponse({ status: 200, description: 'Order ES document' })
  findOrder(@Param('id') id: string) {
    return this.searchService.findOrder(id);
  }

  @Get()
  @ApiOperation({ summary: 'Full-text order search via Elasticsearch' })
  @ApiQuery({ name: 'q',      required: false, description: 'Search query (orderId, userId, items, courier)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by order status' })
  @ApiQuery({ name: 'page',   required: false, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit',  required: false, description: 'Page size (default 10)' })
  @ApiResponse({ status: 200, description: 'Paginated matching orders' })
  search(
    @Query('q')      q?: string,
    @Query('status') status?: string,
    @Query('page')   page = '1',
    @Query('limit')  limit = '10',
  ) {
    return this.searchService.search(q, status, +page, +limit);
  }
}
