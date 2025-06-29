const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const target = process.env.REACT_APP_API_URL 
    ? new URL(process.env.REACT_APP_API_URL).origin 
    : 'https://railway-planner-y1h5.vercel.app';
    
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: true,
      logLevel: 'debug',
    })
  );
};
