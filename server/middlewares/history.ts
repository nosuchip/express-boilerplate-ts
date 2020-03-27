import history from 'connect-history-api-fallback';

export const historyMiddleware = history({
    disableDotRule: true,
    verbose: true,
});
