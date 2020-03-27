import { adminRequired } from '@server/middlewares/admin-required';
import { Route } from '@server/typing/middlewares';
import { Request, Response } from 'express';

export default [
    {
        path: '/',
        method: 'get',
        handlers: {
            v1: [
                adminRequired,
                async (req: Request, res: Response): Promise<void> => {
                    res.status(200).send('Welcome, admin!');
                },
            ],
        },
    },
] as Route[];
