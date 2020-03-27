import { Route } from '@server/typing/middlewares';
import { Request, Response } from 'express';

import { login } from './account.controller';

export default [
    {
        path: '/login',
        method: 'get',
        handlers: {
            v1: [
                async (req: Request, res: Response) => {
                    const result = await login(req.body);
                    res.status(200).send(result);
                },
            ],
        },
    },
] as Route[];
