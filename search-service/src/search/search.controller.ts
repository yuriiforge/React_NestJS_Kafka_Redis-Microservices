import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
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
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Full-text product search' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Matching products' })
  search(@Query('q') q: string, @Query('category') category?: string) {
    return this.searchService.search(q, category);
  }

  @Post('reindex')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Reindex all products from DB into Elasticsearch' })
  @ApiResponse({ status: 201, description: 'Reindex result' })
  reindexAll() {
    return this.searchService.reindexAll();
  }
}
