const { createProxyMiddleware } = require('http-proxy-middleware');

// Only use this proxy in development
if (process.env.NODE_ENV === 'development') {
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
} else {
  // In production, we don't need the proxy
  module.exports = function() {};
}
