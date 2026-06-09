import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

const INDEX = 'analytics-events';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;

  constructor(private readonly config: ConfigService) {
    this.client = new Client({
      node: this.config.get<string>('ELASTICSEARCH_URL', 'http://elasticsearch:9200'),
    });
  }

  async onModuleInit() {
    await this.ensureIndex();
  }

  async indexEvent(type: string, payload: Record<string, unknown>) {
    await this.client.index({
      index: INDEX,
      document: {
        type,
        timestamp: new Date().toISOString(),
        ...payload,
      },
    });
  }

  private async ensureIndex() {
    const exists = await this.client.indices.exists({ index: INDEX });

    if (!exists) {
      try {
        await this.client.indices.create({
          index: INDEX,
          mappings: {
            properties: {
              type:      { type: 'keyword' },
              timestamp: { type: 'date' },
              orderId:   { type: 'keyword' },
              userId:    { type: 'keyword' },
            },
          },
        });
        this.logger.log(`Created Elasticsearch index: ${INDEX}`);
      } catch (err: any) {
        if (err?.meta?.statusCode !== 400) throw err;
      }
    }
  }
}
