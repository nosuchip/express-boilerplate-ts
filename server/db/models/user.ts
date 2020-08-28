import { ErrorEx } from '@server/errors/error-ex';
import { hashPassword } from '@server/libs/password';
import { generateToken, validateToken } from '@server/libs/token';
import mongoose, { Document, Model, Schema } from 'mongoose';

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
    token(): string;
    hasRole(role: Role): boolean;
}

export interface UserModel extends Model<UserInstance> {
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

UserSchema.statics.createNew = async function (attrs: Partial<UserAttributes>): Promise<UserInstance> {
    if (!attrs.email || !attrs.password) {
        throw new Error('Email or password not provided');
    }

    const password = await hashPassword(attrs.password);

    const user = new User({
        ...attrs,
        password,
    });

    return user.save();
};

UserSchema.statics.verifyUser = async function (token: string): Promise<UserInstance> {
    const validated = validateToken(token);

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

    const validated = validateToken(token);

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

    user.password = await hashPassword(password);

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

UserSchema.methods.hasRole = function (role: Role) {
    return this.roles.indexOf(role) !== -1;
};

UserSchema.methods.token = function () {
    return generateToken({ userId: this._id.toString() });
};

export default User;
