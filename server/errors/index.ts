import config from '@server/config';
import logger from '@server/logger';
import { NextFunction, Request, Response } from 'express';
import { Express } from 'express';

import { HttpError } from './http-errors';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    logger.exception(err);

    if (err instanceof HttpError) {
        res.status(err.statusCode).json(err.json());
        return;
    }

    res.status(500).json({
        success: false,
        message: config.isProduction ? 'Internal server error' : err.message,
    });
};

const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    logger.error(`Endpoint ${req.method} ${req.url} not found`);

    res.status(404).json({ success: false, message: 'Requested page not found.' });
};

export const applyErrorHandlers = (app: Express) => {
    app.use(errorHandler);
    app.use(notFoundHandler);
};
