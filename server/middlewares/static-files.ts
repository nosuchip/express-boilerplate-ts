import path from 'path';

import express from 'express';

export const staticFileMiddleware = express.static(path.join(__dirname, '../../client'));
