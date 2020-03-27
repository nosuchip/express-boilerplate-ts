import path from 'path';

import { CorsOptions } from 'cors';

export interface Config {
    isProduction: boolean;
    logLevel: string;
    databaseUri: string;
    appKey: string;
    port: number;
    useSockets: boolean;
    useHistoryForSpa: boolean;
    siteUrl: string;

    cors: CorsOptions;
    // cors: {
    //     whitelist: RegExp[];
    //     credentials: boolean;
    //     origin: (origin: string, callback: (error: Error | null, maatched?: boolean) => void) => void;
    //     optionsSuccessStatus: number
    // };

    jwtOptions: {
        expiresIn: string;
    };

    bearerOptions: {
        bodyKey: string;
        queryKey: string;
        headerKey: string;
        reqKey: string;
    };

    rateLimitOptions: {
        windowMs: number;
        max: number;
        delayMs: number;
    };

    cache: {
        urlCacheOptions: {
            stdTTL: number;
            checkperiod: number;
            deleteOnExpire: boolean;
        };

        proxyCacheOptions: {
            stdTTL: number;
        };
    };

    mailerConfig: {
        auth: {
            apiKey?: string;
        };

        from: string;

        rendererConfig: {
            viewPath: string;
            extName: string;
        };
    };
}

const config: Config = {
    isProduction: process.env.NODE_ENV === 'production',
    logLevel: process.env.LOG_LEVEL || 'info', // 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
    databaseUri: process.env.MONGODB_URI as string,
    appKey: process.env.APP_KEY as string,
    port: parseInt(process.env.PORT || '3000'),
    useSockets: !!process.env.USE_SOCKETS,
    useHistoryForSpa: !!process.env.USE_HISTORY_SPA,
    siteUrl: process.env.SITE_URL as string,

    cors: {
        origin: (process.env.CORS || '').split(' ').map((host) => {
            return new RegExp(host);
        }),
        credentials: true,
        optionsSuccessStatus: 200,
    },

    jwtOptions: {
        expiresIn: '7d',
    },

    bearerOptions: {
        bodyKey: 'access_token',
        queryKey: 'access_token',
        headerKey: 'Bearer',
        reqKey: 'token',
    },

    rateLimitOptions: {
        // 1 minute
        windowMs: 1 * 60 * 1000,

        // 3- requests per windowMs
        max: 30,

        // disable delaying - full speed until the max limit is reached
        delayMs: 0,
    },

    cache: {
        urlCacheOptions: {
            stdTTL: 60,
            checkperiod: 70,
            deleteOnExpire: true,
        },

        proxyCacheOptions: {
            stdTTL: 600, // 10 minutes
        },
    },

    mailerConfig: {
        auth: {
            apiKey: process.env.SENDGRID_API_KEY,
        },
        from: 'info@domain.com',
        rendererConfig: {
            viewPath: path.join(__dirname, 'templates/emails/'),
            extName: '.handlebars',
        },
    },
};

export default config;
