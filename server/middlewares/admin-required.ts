import { Role } from '@server/db/models/user';
import logger from '@server/logger';
import { NextFunction, Request, Response } from 'express';

import { Http400Error, Http403Error } from '../errors/http-errors';

export const adminRequired = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.debug(`loginRequired: Current user: ${JSON.stringify(req.user)}`);

    if (!req.user) {
        throw new Http400Error({ message: 'Authentication required' });
    }

    if (!req.user.isActive || !req.user.confirmedAt) {
        throw new Http403Error({ message: 'User not confirmed or inactive' });
    }

    if (!req.user.hasRole(Role.Admin)) {
        throw new Http403Error({ message: 'Admin privileges required', redirect: '/' });
    }

    logger.info(`User check passed`);

    next(null);
};
