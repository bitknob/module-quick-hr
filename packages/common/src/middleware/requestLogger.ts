import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { RequestLog } from '../types';

export type RequestLogSaveFunction = (log: RequestLog) => Promise<void> | void;

let saveRequestLog: RequestLogSaveFunction | null = null;
let serviceName: string = 'unknown';

export const setRequestLogger = (
  saveFn: RequestLogSaveFunction,
  svcName: string = 'unknown'
): void => {
  saveRequestLog = saveFn;
  serviceName = svcName;
};

const sanitizeHeaders = (headers: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = ['authorization', 'cookie', 'x-api-key', 'password', 'token'];
  
  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

const sanitizeBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized: any = Array.isArray(body) ? [] : {};
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];

  for (const [key, value] of Object.entries(body)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeBody(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

const getClientIp = (req: Request): string | undefined => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    req.ip
  );
};

export const requestLogger = (
  req: Request & { startTime?: number },
  res: Response,
  next: NextFunction
): void => {
  if (!saveRequestLog) {
    return next();
  }

  const startTime = Date.now();
  req.startTime = startTime;

  const originalSend = res.send;
  const originalJson = res.json;

  let responseBody: any = null;
  let responseStatus: number = res.statusCode || 200;

  const captureResponse = (body: any): any => {
    responseBody = body;
    responseStatus = res.statusCode || 200;
    return body;
  };

  res.send = function (body: any): Response {
    captureResponse(body);
    return originalSend.call(this, body);
  };

  res.json = function (body: any): Response {
    captureResponse(body);
    return originalJson.call(this, body);
  };

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const authReq = req as AuthRequest;
      
      const log: RequestLog = {
        userId: authReq.user?.uid || authReq.user?.userId,
        method: req.method,
        url: req.originalUrl || req.url,
        path: req.path,
        queryParams: Object.keys(req.query).length > 0 ? req.query : undefined,
        requestHeaders: sanitizeHeaders(req.headers as Record<string, any>),
        requestBody: req.body && Object.keys(req.body).length > 0 ? sanitizeBody(req.body) : undefined,
        responseStatus,
        responseBody: responseBody ? sanitizeBody(JSON.parse(typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody))) : undefined,
        responseHeaders: sanitizeHeaders(res.getHeaders() as Record<string, any>),
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
        duration,
        serviceName,
      };

      if (authReq.user?.uid) {
        log.userId = authReq.user.uid;
      }

      if ((req as any).employee) {
        log.employeeId = (req as any).employee.id;
        log.companyId = (req as any).employee.companyId;
      }

      if (saveRequestLog) {
        await saveRequestLog(log);
      }
    } catch (error) {
      console.error('Error saving request log:', error);
    }
  });

  next();
};

