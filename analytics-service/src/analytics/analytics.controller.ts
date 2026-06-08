import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@ecommerce/shared';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Sliding window stats for the dashboard' })
  @ApiQuery({
    name: 'window',
    required: false,
    description: 'Window size in seconds (default 60)',
  })
  @ApiResponse({ status: 200, description: 'Aggregated stats' })
  getStats(@Query('window') window?: string) {
    const windowSeconds = window ? parseInt(window, 10) : 60;
    return this.analyticsService.getStats(windowSeconds);
  }
}
