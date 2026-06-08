import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get('docs')
  docs(@Res() res: Response) {
    res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Ecommerce API</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>body { margin: 0; }</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      SwaggerUIBundle({
        dom_id: '#swagger-ui',
        deepLinking: true,
        urls: [
          { url: '/docs/auth-spec',     name: 'Auth'     },
          { url: '/docs/products-spec', name: 'Products' },
          { url: '/docs/orders-spec',   name: 'Orders'   },
        ],
        "urls.primaryName": "Auth",
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout",
      });
    </script>
  </body>
</html>`);
  }
}
