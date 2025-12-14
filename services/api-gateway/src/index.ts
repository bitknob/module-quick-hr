import './config/env';
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger, errorHandler, ResponseFormatter } from '@hrm/common';

const app = express();
const PORT = process.env.PORT || process.env.API_GATEWAY_PORT || 9400;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:9401';
const EMPLOYEE_SERVICE_URL = process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:9402';

app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api/auth',
    },
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${AUTH_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(500).json({
        success: false,
        error: 'Service temporarily unavailable',
      });
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
    onProxyReq: (proxyReq, req) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${EMPLOYEE_SERVICE_URL}`);
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error: ${err.message}`);
      res.status(500).json({
        success: false,
        error: 'Service temporarily unavailable',
      });
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
});

