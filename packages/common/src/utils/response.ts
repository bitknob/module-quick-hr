import { Response } from 'express';

export interface StandardResponseHeader {
  responseCode: number;
  responseMessage: string;
  responseDetail: string;
}

export interface StandardResponse<T = any> {
  header: StandardResponseHeader;
  response: T;
}

export class ResponseFormatter {
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    detail: string = '',
    statusCode: number = 200
  ): void {
    const response: StandardResponse<T> = {
      header: {
        responseCode: statusCode,
        responseMessage: message,
        responseDetail: detail,
      },
      response: data,
    };

    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    detail: string = '',
    statusCode: number = 500
  ): void {
    const response: StandardResponse<null> = {
      header: {
        responseCode: statusCode,
        responseMessage: message,
        responseDetail: detail,
      },
      response: null,
    };

    res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success',
    detail: string = ''
  ): void {
    const paginationDetail = detail || `Total: ${total}, Page: ${page}, Limit: ${limit}, Total Pages: ${Math.ceil(total / limit)}`;
    const response: StandardResponse<T[]> = {
      header: {
        responseCode: 200,
        responseMessage: message,
        responseDetail: paginationDetail,
      },
      response: data,
    };

    res.status(200).json(response);
  }
}

