require('express-async-errors');

import { once } from 'events';
import http from 'http';

import config from '@server/config';
import db from '@server/db';
import { applyErrorHandlers } from '@server/errors';
import logger from '@server/logger';
import { applyMiddlewares, applyRoutes } from '@server/middlewares';
import accountRoutes from '@server/routes/account/routes';
import adminRoutes from '@server/routes/admin/routes';
import appRoutes from '@server/routes/app/routes';
import socket from '@server/websockets';
import express from 'express';

import { historyMiddleware } from './middlewares/history';

export const app = express();

export const runApp = async () => {
    await db.initialize();

    app.disable('x-powered-by');
    app.enable('trust proxy');

    applyMiddlewares(app);

    applyRoutes('', appRoutes, app);
    applyRoutes('account', accountRoutes, app);
    applyRoutes('admin', adminRoutes, app);

    if (config.useHistoryForSpa) {
        app.use(historyMiddleware);
    }

    applyErrorHandlers(app);

    const server = new http.Server(app);

    if (config.useSockets) {
        socket.initialize(server);
    }

    const listener = server.listen(config.port);

    await once(listener, 'listening');
    logger.info('Server running on the port ' + config.port);

    return app;
};
