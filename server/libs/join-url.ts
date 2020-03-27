export const joinUrl = (...parts: string[]): string => {
    return parts.join('/').replace(/\/+/g, '/');
};
