import { Route } from '@server/typing/middlewares';
import { Request, Response } from 'express';

import { login, register, resetPassword, setResettedPassword, verifyResetToken } from './account.controller';

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
    {
        path: '/register',
        method: 'post',
        handlers: {
            v1: [
                async (req: Request, res: Response) => {
                    const result = await register(req.body);
                    res.status(200).send(result);
                },
            ],
        },
    },
    {
        path: '/reset',
        method: 'post',
        handlers: {
            v1: [
                async (req: Request, res: Response) => {
                    const result = await resetPassword(req.body);
                    res.status(200).send(result);
                },
            ],
        },
    },
    {
        path: '/setNewPassword',
        method: 'post',
        handlers: {
            v1: [
                async (req: Request, res: Response) => {
                    const result = await setResettedPassword(req.body);
                    res.status(200).send(result);
                },
            ],
        },
    },
    {
        path: '/verifyToken',
        method: 'post',
        handlers: {
            v1: [
                async (req: Request, res: Response) => {
                    const result = await verifyResetToken(req.body);
                    res.status(200).send(result);
                },
            ],
        },
    },
] as Route[];
