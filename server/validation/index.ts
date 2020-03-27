import { Http400Error } from '@server/errors/http-errors';
import { NextFunction, Request, Response } from 'express';
import { buildCheckFunction, validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        validationResult(req).throw();
    } catch (error) {
        throw new Http400Error(error);
    }

    next();
};

export const checkRequest = buildCheckFunction(['body', 'query', 'params']);

export { ValidationChain } from 'express-validator';
