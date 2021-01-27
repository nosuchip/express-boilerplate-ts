import config from '@server/config';
import winston, { format } from 'winston';
import * as Transport from 'winston-transport';

const alignedWithColorsAndTime = format.combine(
    format.colorize({ all: true }),
    format.timestamp(),
    format.align(),
    format.printf((info) => {
        const { timestamp, level, message, ...args } = info;

        const ts = timestamp ? timestamp.slice(0, 19).replace('T', ' ') : new Date().toISOString().replace('T', ' ');

        return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
    }),
);

const transports: Transport[] = [
    new winston.transports.Console({
        level: config.logLevel,
        format: alignedWithColorsAndTime,
    }),
];

export interface BetterLogger extends winston.Logger {
    exception: (error: Error, prefix?: string) => BetterLogger;
}

const logger: BetterLogger = winston.createLogger({
    level: config.logLevel,
    transports,
}) as BetterLogger;

// Monkey patching Winston because it incorrectly logs `Error` instances
// Related issue: https://github.com/winstonjs/winston/issues/1498
logger.exception = function (error, prefix?) {
    const message = error.message || error.toString();
    const stack = error.stack;
    prefix = prefix ? `${prefix} ` : '';

    return this.error(`${prefix}${message}, stack ${stack}`) as BetterLogger;
};

export default logger;
