import config from '@server/config';
import User from '@server/db/models/user';
import logger from '@server/logger';
import { Dictionary } from '@server/typing/generics';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const userTokenMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.token) {
        next(null);
        return;
    }

    try {
        const decoded = jwt.verify(req.token, config.appKey) as Dictionary;
        req.user = await User.findById(decoded.userId);

        logger.debug(
            `userTokenMiddleware: decoded token: ${JSON.stringify(decoded)}, user: ${JSON.stringify(req.user)}`,
        );
    } catch (error) {
        logger.error(`User token middleware error: ${error}`);
    }

    next(null);
};
