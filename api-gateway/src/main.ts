import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { jwtMiddleware } from './jwt.middleware';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  // protected routes — JWT check runs before proxy
  app.use('/api/orders', jwtMiddleware);
  app.use('/api/products', jwtMiddleware);
  app.use('/api/search', jwtMiddleware);
  app.use('/api/analytics', jwtMiddleware);
  app.use('/api/events', jwtMiddleware);

  // single proxy — intercepts all /api/* before NestJS strips prefixes
  app.use(
    createProxyMiddleware({
      target: 'http://auth-service:3006', // default target, overridden by router
      changeOrigin: true,
      router: {
        '/api/auth': 'http://auth-service:3006',
        '/api/orders': 'http://order-service:3001',
        '/api/events': 'http://order-service:3001',
        '/api/products': 'http://product-service:3007',
        '/api/search': 'http://search-service:3005',
        '/api/analytics': 'http://analytics-service:3004',
      },
      pathRewrite: (path) => {
        if (path.startsWith('/api/auth'))
          return path.replace('/api/auth', '/auth');
        if (path.startsWith('/api/orders'))
          return path.replace('/api/orders', '/orders');
        if (path.startsWith('/api/events'))
          return path.replace('/api/events', '/events');
        if (path.startsWith('/api/products'))
          return path.replace('/api/products', '/products');
        if (path.startsWith('/api/search'))
          return path.replace('/api/search', '/search');
        if (path.startsWith('/api/analytics'))
          return path.replace('/api/analytics', '/analytics');
        return path;
      },
      on: {
        proxyReq: (proxyReq) => {
          console.log('Proxying to:', proxyReq.path);
        },
      },
    }),
  );

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
