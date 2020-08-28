import crypto from 'crypto';
import { promisify } from 'util';

import { ErrorEx } from '@server/errors/error-ex';

export const PasswordLength = 128;
export const SaltLen = 16;
export const Iterations = 10000;
export const Digest = 'sha512';

export const hashPassword = async (password: string, salt?: string): Promise<string> => {
    salt = salt || crypto.randomBytes(SaltLen).toString('hex').slice(0, SaltLen);
    const hash = await promisify(crypto.pbkdf2)(password, salt, Iterations, PasswordLength, Digest);

    return [salt, Iterations.toString(), hash.toString('hex')].join('.');
};

export const checkPassword = async (hashed: string, password: string): Promise<void> => {
    try {
        const [salt, iterations, hash] = hashed.split('.');

        if (!iterations || !hash) {
            throw new Error('Hashed value not a password');
        }

        const checkHashed = await hashPassword(password, salt);

        if (checkHashed !== hashed) {
            throw new Error('Password incorrect');
        }
    } catch (error) {
        throw new ErrorEx('Password mismatch');
    }
};
