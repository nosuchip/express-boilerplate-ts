import { NextFunction, Request, Response } from 'express';
import { Dictionary } from 'express-serve-static-core';

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'patch' | 'options';
export type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

export type Middleware = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;
export type ErrorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => Promise<void> | void;

export type ApiHandlerVersioned = Dictionary<ExpressHandler[]>;

export interface Route {
    path: string;
    method: HttpMethod;
    handlers: ApiHandlerVersioned;
}
