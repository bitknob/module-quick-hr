import './config/env';
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger, errorHandler, ResponseFormatter } from '@hrm/common';

const app = express();
const PORT = process.env.PORT || process.env.API_GATEWAY_PORT || 9400;

app.use(cors());
// NOTE: Do NOT add body parsing middleware here (express.json() or express.urlencoded())
// Body parsing consumes the request stream, which prevents the proxy from forwarding
// the request body to downstream services. Each downstream service parses its own body.

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:9401';
const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:9402';

const PAYROLL_SERVICE_URL = process.env.PAYROLL_SERVICE_URL || 'http://localhost:9403';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:9404';

app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api/auth',
    },
    timeout: 60000, // 60 second timeout
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${AUTH_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      // Handle specific error codes
      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
    onProxyReqWs: (proxyReq, req, socket) => {
      // Handle WebSocket upgrades if needed
    },
  })
);

app.use(
  '/api/employees',
  createProxyMiddleware({
    target: EMPLOYEE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/employees': '/api/employees',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${EMPLOYEE_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/approvals',
  createProxyMiddleware({
    target: EMPLOYEE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/approvals': '/api/approvals',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${EMPLOYEE_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/companies',
  createProxyMiddleware({
    target: EMPLOYEE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/companies': '/api/companies',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${EMPLOYEE_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/departments',
  createProxyMiddleware({
    target: EMPLOYEE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/departments': '/api/departments',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${EMPLOYEE_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/search',
  createProxyMiddleware({
    target: EMPLOYEE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/search': '/api/search',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${EMPLOYEE_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/documents',
  createProxyMiddleware({
    target: EMPLOYEE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/documents': '/api/documents',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${EMPLOYEE_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/attendance',
  createProxyMiddleware({
    target: EMPLOYEE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/attendance': '/api/attendance',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${EMPLOYEE_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/leaves',
  createProxyMiddleware({
    target: EMPLOYEE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/leaves': '/api/leaves',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${EMPLOYEE_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/devices',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/devices': '/api/devices',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${AUTH_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/roles',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/roles': '/api/roles',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${AUTH_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/payroll',
  createProxyMiddleware({
    target: PAYROLL_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/payroll': '/api/payroll',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${PAYROLL_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/payments',
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/payments': '/api/payments',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${PAYMENT_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/subscriptions',
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/subscriptions': '/api/subscriptions',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${PAYMENT_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/pricing-plans',
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/pricing-plans': '/api/pricing-plans',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${PAYMENT_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.use(
  '/api/subscription-history',
  createProxyMiddleware({
    target: PAYMENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/subscription-history': '/api/subscription-history',
    },
    timeout: 60000,
    proxyTimeout: 60000,
    logLevel: 'warn',
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${PAYMENT_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      if (res.headersSent) {
        return;
      }

      logger.error(`Proxy error: ${err.message}`, { code: (err as any).code });

      if (
        (err as any).code === 'ECONNREFUSED' ||
        (err as any).code === 'ECONNRESET' ||
        (err as any).code === 'ETIMEDOUT'
      ) {
        res.status(503).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again.',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Service temporarily unavailable',
        });
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.info(`Proxy response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
  })
);

app.get('/health', (req, res) => {
  ResponseFormatter.success(
    res,
    {
      status: 'ok',
      service: 'api-gateway',
      services: {
        auth: AUTH_SERVICE_URL,
        employee: EMPLOYEE_SERVICE_URL,

        payroll: PAYROLL_SERVICE_URL,
        payment: PAYMENT_SERVICE_URL,
      },
    },
    'API Gateway is healthy'
  );
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Proxying auth service: ${AUTH_SERVICE_URL}`);
  logger.info(`Proxying employee service: ${EMPLOYEE_SERVICE_URL}`);

  logger.info(`Proxying payroll service: ${PAYROLL_SERVICE_URL}`);
  logger.info(`Proxying payment service: ${PAYMENT_SERVICE_URL}`);
});
