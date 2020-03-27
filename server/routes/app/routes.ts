import { Route } from '@server/typing/middlewares';
import { Request, Response } from 'express';

export default [
    {
        path: '/',
        method: 'get',
        handlers: {
            v1: [
                async (req: Request, res: Response): Promise<void> => {
                    res.status(200).send('API');
                },
            ],
        },
    },
    {
        path: '/error',
        method: 'get',
        handlers: {
            v1: [
                async (req: Request, res: Response): Promise<void> => {
                    throw new Error('Something unexpected happens!');
                },
            ],
        },
    },
] as Route[];
