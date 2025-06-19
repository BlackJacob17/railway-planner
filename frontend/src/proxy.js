const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL ? new URL(process.env.REACT_APP_API_URL).origin : 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    })
  );
};
