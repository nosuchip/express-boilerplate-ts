import crypto from 'crypto';
import { promisify } from 'util';

import Config from '@server/config';
import { ErrorEx } from '@server/errors/error-ex';
import { Dictionary } from '@server/typing/generics';
import jwt from 'jsonwebtoken';
import mongoose, { Document, Model, Schema } from 'mongoose';

const PasswordLength = 128;
const SaltLen = 16;
const Iterations = 10000;
const Digest = 'sha512';

export enum Role {
    Admin = 'admin',
}

export interface UserAttributes extends Document {
    _id: string;
    email: string;
    password: string;
    isActive: boolean;
    confirmedAt?: Date;
    roles: Role[];
    createdAt: Date;
    updatedAt: Date;
}

export interface UserInstance extends UserAttributes {
    checkPassword(password: string): Promise<UserInstance>;
    token(): string;
    hasRole(role: Role): boolean;
}

export interface UserModel extends Model<UserInstance> {
    validateToken(token: string): Dictionary;
    hashPassword(password: string, salt?: string): Promise<string>;
    createNew(attrs: Partial<UserAttributes>): Promise<UserInstance>;
    verifyUser(token: string): Promise<UserInstance>;
    setNewPassword(token: string, password: string, confirmation: string): Promise<UserInstance>;
    assignRoles(userId: string, roles: Role[]): Promise<UserInstance>;
}

const UserSchema = new Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
        isActive: { type: Boolean, default: false },
        confirmedAt: { type: Date },
        roles: [{ type: String }],
    },
    {
        timestamps: true,
    },
);

const User: UserModel = mongoose.model<UserAttributes, UserModel>('User', UserSchema, 'users');

UserSchema.statics.validateToken = (token: string): Dictionary => {
    let decoded: Dictionary | null = null;

    try {
        decoded = jwt.verify(token, Config.appKey) as Dictionary;
    } catch (error) {
        if (error.name === 'TokenExpiredError') return { valid: true, expired: true };

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

UserSchema.statics.hashPassword = async (password: string, salt?: string): Promise<string> => {
    salt = salt || crypto.randomBytes(SaltLen).toString('hex').slice(0, SaltLen);
    const hash = await promisify(crypto.pbkdf2)(password, salt, Iterations, PasswordLength, Digest);

    return [salt, Iterations.toString(), hash.toString('hex')].join('.');
};

UserSchema.statics.createNew = async function (attrs: Partial<UserAttributes>): Promise<UserInstance> {
    if (!attrs.email || !attrs.password) {
        throw new Error('Email or password not provided');
    }

    const password = await User.hashPassword(attrs.password);

    const user = new User({
        ...attrs,
        password,
    });

    return user.save();
};

UserSchema.statics.verifyUser = async function (token: string): Promise<UserInstance> {
    const validated = User.validateToken(token);

    if (!validated.valid || !validated.data) {
        throw new ErrorEx('Token invalid');
    }

    if (validated.expired) {
        throw new ErrorEx({ message: 'Confirmation url expired', expired: true });
    }

    const user = await this.findById(validated.data.userId);

    if (!user) {
        throw new ErrorEx('User not found');
    }

    if (user.confirmedAt) {
        throw new ErrorEx({ message: 'User already confirmed', alreadyConfirmed: true });
    }

    user.confirmedAt = new Date();
    return user.save();
};

UserSchema.statics.setNewPassword = async function (
    token: string,
    password: string,
    confirmation: string,
): Promise<UserInstance> {
    if (password !== confirmation) {
        throw new ErrorEx('Password and confirmation does not match');
    }

    const validated = User.validateToken(token);

    if (!validated.valid) {
        throw new ErrorEx('Token invalid');
    }

    if (validated.expired) {
        throw new ErrorEx({ message: 'Confirmation url expired', expired: true });
    }

    const user = await User.findById(validated.data.userId);

    if (!user) {
        throw new ErrorEx('User not found');
    }

    if (!user.confirmedAt) {
        user.confirmedAt = new Date();
    }

    user.password = await User.hashPassword(password);

    return user.save();
};

UserSchema.statics.assignRoles = async function (userId: string, roles: Role[]): Promise<UserInstance> {
    const user = await User.findById(userId);

    if (!user) {
        throw new ErrorEx('User not found');
    }

    user.roles = [...new Set([...user.roles, ...roles])];
    return user.save();
};

UserSchema.methods.checkPassword = async function (password: string): Promise<UserInstance> {
    try {
        const [salt, iterations, hash] = this.password.split('.');

        if (!iterations || !hash) {
            throw new Error();
        }

        const hashed = await User.hashPassword(password, salt);

        if (hashed !== this.password) {
            throw new Error();
        }
    } catch (error) {
        throw new ErrorEx('Password mismatch');
    }

    return this as UserInstance;
};

UserSchema.methods.token = function () {
    const data = { userId: this._id.toString() };
    return jwt.sign(data, Config.appKey, Config.jwtOptions);
};

UserSchema.methods.hasRole = function (role: Role) {
    return this.roles.indexOf(role) !== -1;
};

export default User;
