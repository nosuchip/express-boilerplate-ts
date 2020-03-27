import compression from 'compression';
import { RequestHandler } from 'express';

export const compressionMiddleware: RequestHandler = compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
});
