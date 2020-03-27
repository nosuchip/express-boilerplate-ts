import { NextFunction, Request, Response } from 'express';

export const redirectToHttpsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.HEROKU_APP_NAME) {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            res.redirect(301, 'https://' + req.hostname + req.originalUrl);

            return;
        }
    }

    next();
};
