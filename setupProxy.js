const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy for Yandex Taxi API to handle CORS
  app.use(
    '/api/yandex-taxi',
    createProxyMiddleware({
      target: 'https://taxi-routeinfo.taxi.yandex.net',
      changeOrigin: true,
      pathRewrite: {
        '^/api/yandex-taxi': '', // Remove /api/yandex-taxi prefix
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add CORS headers
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
        proxyReq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, YaTaxi-Api-Key');
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers to response
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-API-Key, YaTaxi-Api-Key';
      },
      logLevel: 'debug'
    })
  );

  // Proxy for Yandex Maps API
  app.use(
    '/api/yandex-maps',
    createProxyMiddleware({
      target: 'https://api-maps.yandex.ru',
      changeOrigin: true,
      pathRewrite: {
        '^/api/yandex-maps': '',
      },
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Access-Control-Allow-Origin', '*');
      },
      onProxyRes: (proxyRes, req, res) => {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      }
    })
  );
};
