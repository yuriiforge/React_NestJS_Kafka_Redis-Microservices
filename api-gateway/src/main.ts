import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { jwtMiddleware } from './jwt.middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // protected routes — JWT check first
  app.use('/api/orders', jwtMiddleware);
  app.use('/api/products', jwtMiddleware);
  app.use('/api/search', jwtMiddleware);
  app.use('/api/analytics', jwtMiddleware);
  app.use('/api/events', jwtMiddleware);

  // proxies
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://auth-service:3006',
      changeOrigin: true,
      pathRewrite: { '^/api/auth': '/auth' },
    }),
  );

  app.use(
    '/api/orders',
    createProxyMiddleware({
      target: 'http://order-service:3001',
      changeOrigin: true,
      pathRewrite: { '^/api/orders': '/orders' },
    }),
  );

  app.use(
    '/api/events',
    createProxyMiddleware({
      target: 'http://order-service:3001',
      changeOrigin: true,
      pathRewrite: { '^/api/events': '/events' },
    }),
  );

  app.use(
    '/api/products',
    createProxyMiddleware({
      target: 'http://product-service:3007',
      changeOrigin: true,
      pathRewrite: { '^/api/products': '/products' },
    }),
  );

  app.use(
    '/api/search',
    createProxyMiddleware({
      target: 'http://search-service:3005',
      changeOrigin: true,
      pathRewrite: { '^/api/search': '/search' },
    }),
  );

  app.use(
    '/api/analytics',
    createProxyMiddleware({
      target: 'http://analytics-service:3004',
      changeOrigin: true,
      pathRewrite: { '^/api/analytics': '/analytics' },
    }),
  );

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
