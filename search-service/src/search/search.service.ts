import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { prisma } from '@ecommerce/shared';

const INDEX = 'products';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly client: Client;

  constructor(config: ConfigService) {
    this.client = new Client({
      node: config.get<string>('ELASTICSEARCH_URL', 'http://elasticsearch:9200'),
    });
  }

  async onModuleInit() {
    await this.ensureIndex();
  }

  private async ensureIndex() {
    const exists = await this.client.indices.exists({ index: INDEX });
    if (!exists) {
      try {
        await this.client.indices.create({
          index: INDEX,
          mappings: {
            properties: {
              id:          { type: 'keyword' },
              name:        { type: 'text' },
              description: { type: 'text' },
              category:    { type: 'keyword' },
              price:       { type: 'float' },
              stock:       { type: 'integer' },
              isActive:    { type: 'boolean' },
            },
          },
        });
        this.logger.log(`Created index: ${INDEX}`);
      } catch (err: any) {
        if (err?.meta?.statusCode !== 400) throw err;
      }
    }
  }

  async reindexAll() {
    const products = await prisma.product.findMany({ where: { isActive: true } });

    if (products.length === 0) return { indexed: 0 };

    const operations = products.flatMap((p) => [
      { index: { _index: INDEX, _id: p.id } },
      {
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        stock: p.stock,
        isActive: p.isActive,
      },
    ]);

    await this.client.bulk({ operations });
    this.logger.log(`Reindexed ${products.length} products`);

    return { indexed: products.length };
  }

  async indexProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return;

    await this.client.index({
      index: INDEX,
      id: product.id,
      document: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        isActive: product.isActive,
      },
    });
  }

  async search(query: string, category?: string) {
    const must: object[] = [
      {
        multi_match: {
          query,
          fields: ['name^2', 'description', 'category'],
          fuzziness: 'AUTO',
        },
      },
    ];

    if (category) {
      must.push({ term: { category } });
    }

    const result = await this.client.search({
      index: INDEX,
      query: { bool: { must, filter: [{ term: { isActive: true } }] } },
    });

    return result.hits.hits.map((hit) => hit._source);
  }
}
