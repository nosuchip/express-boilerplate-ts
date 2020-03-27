import { ValidationChain, checkRequest } from './index';

export const checkTestBody: ValidationChain[] = [
    checkRequest('title').exists({ checkNull: true, checkFalsy: true }).withMessage('Test title required'),
    checkRequest('description').optional(),
];
