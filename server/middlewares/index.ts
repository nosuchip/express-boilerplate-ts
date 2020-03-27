import config from '@server/config';
import { joinUrl } from '@server/libs/join-url';
import logger from '@server/logger';
import { ApiHandlerVersioned, ExpressHandler, HttpMethod, Route } from '@server/typing/middlewares';
import bodyParserMiddleware from 'body-parser';
import corsMiddleware from 'cors';
import { Express, Router } from 'express';
import bearerTokenMiddleware from 'express-bearer-token';
import rateLimitMiddleware from 'express-rate-limit';

import { compressionMiddleware } from './compression-middleware';
import { redirectToHttpsMiddleware } from './redirect-to-https';
import { staticFileMiddleware } from './static-files';
import { userTokenMiddleware } from './user-token';

export const applyMiddlewares = (app: Express) => {
    app.use(rateLimitMiddleware(config.rateLimitOptions));
    app.use(redirectToHttpsMiddleware);
    app.use(bodyParserMiddleware.json({ limit: '4mb' }));
    app.use(bodyParserMiddleware.urlencoded({ extended: false, limit: '4mb' }));
    app.use(bearerTokenMiddleware(config.bearerOptions));
    app.use(corsMiddleware(config.cors));
    app.options('*', corsMiddleware(config.cors));

    app.use(userTokenMiddleware);

    app.use(compressionMiddleware);
    app.use(staticFileMiddleware);
};

export const applyRoutes = (prefix: string, routes: Route[], router: Router, apiVersion = 'v1'): void => {
    for (const route of routes) {
        const { method, path, handlers }: { method: HttpMethod; path: string; handlers: ApiHandlerVersioned } = route;

        const versionedApiHanlers: ExpressHandler[] = handlers[apiVersion];

        if (!versionedApiHanlers) {
            return console.warn(`${path} not available in api ${apiVersion}`);
        }

        const url = joinUrl('/api', apiVersion, prefix, path);

        logger.debug(`Applying route "${method}" handler for ${url}`);
        router[method](url, versionedApiHanlers as any);
    }
};
