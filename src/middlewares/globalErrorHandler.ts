import { v4 as uuid } from 'uuid';
import logger from '../config/logger';
import path from 'path';

export const globalErrorHandler = (err: any, req: any, res: any, next: any) => {
    const errorId = uuid()
    const statusCode = err.statusCode || err.status || 500;
    const isProd = process.env.NODE_ENV === 'production';
    const message = isProd ? 'Internal Server Error' : err.message;
    logger.error(err.message,{
        errorId,
        stack: err.stack,
        path: path.basename(req.path),
        method: req.method,
    });
    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                msg: message,
                path: path.basename(req.path),
                method: req.method,
                location: "server",
                stack: isProd ? undefined : err.stack,
            }
        ]
    })
}