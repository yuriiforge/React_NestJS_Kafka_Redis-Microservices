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

  // ── Swagger spec proxies ───────────────────────────────────────
  app.use(createProxyMiddleware({ target: 'http://auth-service:3006',      changeOrigin: true, pathFilter: '/docs/auth-spec',      pathRewrite: { '^/docs/auth-spec':      '/docs-json' } }));
  app.use(createProxyMiddleware({ target: 'http://product-service:3007',   changeOrigin: true, pathFilter: '/docs/products-spec',  pathRewrite: { '^/docs/products-spec':  '/docs-json' } }));
  app.use(createProxyMiddleware({ target: 'http://order-service:3001',     changeOrigin: true, pathFilter: '/docs/orders-spec',    pathRewrite: { '^/docs/orders-spec':    '/docs-json' } }));
  app.use(createProxyMiddleware({ target: 'http://payment-service:3002',   changeOrigin: true, pathFilter: '/docs/payments-spec',  pathRewrite: { '^/docs/payments-spec':  '/docs-json' } }));
  app.use(createProxyMiddleware({ target: 'http://delivery-service:3003',  changeOrigin: true, pathFilter: '/docs/deliveries-spec',pathRewrite: { '^/docs/deliveries-spec':'/docs-json' } }));
  app.use(createProxyMiddleware({ target: 'http://analytics-service:3004', changeOrigin: true, pathFilter: '/docs/analytics-spec', pathRewrite: { '^/docs/analytics-spec': '/docs-json' } }));
  app.use(createProxyMiddleware({ target: 'http://search-service:3005',    changeOrigin: true, pathFilter: '/docs/search-spec',    pathRewrite: { '^/docs/search-spec':    '/docs-json' } }));

  // ── JWT guard on protected routes ─────────────────────────────
  app.use('/api/orders',    jwtMiddleware);
  app.use('/api/products',  jwtMiddleware);
  app.use('/api/payments',  jwtMiddleware);
  app.use('/api/deliveries',jwtMiddleware);
  app.use('/api/search',    jwtMiddleware);
  app.use('/api/analytics', jwtMiddleware);

  // ── Main API proxy ─────────────────────────────────────────────
  app.use(
    createProxyMiddleware({
      pathFilter: '/api',
      target: 'http://auth-service:3006',
      changeOrigin: true,
      router: {
        '/api/auth':       'http://auth-service:3006',
        '/api/products':   'http://product-service:3007',
        '/api/orders':     'http://order-service:3001',
        '/api/payments':   'http://payment-service:3002',
        '/api/deliveries': 'http://delivery-service:3003',
        '/api/analytics':  'http://analytics-service:3004',
        '/api/search':     'http://search-service:3005',
      },
      pathRewrite: (path) => {
        if (path.startsWith('/api/auth'))       return path.replace('/api/auth',       '/auth');
        if (path.startsWith('/api/products'))   return path.replace('/api/products',   '/products');
        if (path.startsWith('/api/orders'))     return path.replace('/api/orders',     '/orders');
        if (path.startsWith('/api/payments'))   return path.replace('/api/payments',   '/payments');
        if (path.startsWith('/api/deliveries')) return path.replace('/api/deliveries', '/deliveries');
        if (path.startsWith('/api/analytics'))  return path.replace('/api/analytics',  '/analytics');
        if (path.startsWith('/api/search'))     return path.replace('/api/search',     '/search');
        return path;
      },
    }),
  );

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
