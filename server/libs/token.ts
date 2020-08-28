import Config from '@server/config';
import { Dictionary } from '@server/typing/generics';
import jwt from 'jsonwebtoken';

export const validateToken = (token: string): Dictionary => {
    let decoded: Dictionary | null = null;

    try {
        decoded = jwt.verify(token, Config.appKey) as Dictionary;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: true, expired: true };
        }

        return { valid: false };
    }

    const expirationDate = new Date(decoded.exp * 1000);

    if (new Date() > expirationDate) {
        return { valid: true, expired: true };
    }

    return {
        valid: true,
        data: decoded,
        expired: false,
    };
};

export const generateToken = (data: Dictionary) => {
    return jwt.sign(data, Config.appKey, Config.jwtOptions);
};
