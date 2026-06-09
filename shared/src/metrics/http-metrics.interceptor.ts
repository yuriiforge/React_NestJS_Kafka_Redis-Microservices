import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Counter, Histogram, register } from 'prom-client';

function counter(name: string, help: string, labelNames: string[]): Counter<string> {
  return (register.getSingleMetric(name) as Counter<string>) ??
    new Counter({ name, help, labelNames });
}

function histogram(name: string, help: string, labelNames: string[], buckets: number[]): Histogram<string> {
  return (register.getSingleMetric(name) as Histogram<string>) ??
    new Histogram({ name, help, labelNames, buckets });
}

const httpRequestsTotal = counter(
  'http_requests_total',
  'Total number of HTTP requests',
  ['method', 'route', 'status'],
);

const httpDurationSeconds = histogram(
  'http_request_duration_seconds',
  'HTTP request duration in seconds',
  ['method', 'route'],
  [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 3],
);

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<{ method?: string; route?: { path?: string }; url?: string }>();
    const method = req.method ?? 'UNKNOWN';
    const route  = req.route?.path ?? req.url ?? 'unknown';
    const end    = httpDurationSeconds.startTimer({ method, route });

    return next.handle().pipe(
      tap({
        next: () => {
          const status = String(ctx.switchToHttp().getResponse<{ statusCode?: number }>().statusCode ?? 200);
          httpRequestsTotal.inc({ method, route, status });
          end();
        },
        error: () => {
          httpRequestsTotal.inc({ method, route, status: '500' });
          end();
        },
      }),
    );
  }
}
