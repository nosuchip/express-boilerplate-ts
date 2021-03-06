import config from '@server/config';
import User, { UserInstance } from '@server/db/models/user';
import { Http400Error, Http403Error, Http404Error, Http409Error, Http419Error } from '@server/errors/http-errors';
import { joinUrl } from '@server/libs/join-url';
import { checkPassword } from '@server/libs/password';
import mailer from '@server/mailer';

export interface LoginResponse {
    user: UserInstance;
    token: string;
}

export const login = async ({ username, password }: { username: string; password: string }): Promise<LoginResponse> => {
    const user = await User.findOne({
        email: username,
    });

    if (!user) {
        throw new Http404Error('User not found');
    }

    if (!user.isActive || !user.confirmedAt) {
        throw new Http403Error('User not confirmed or inactive');
    }

    await checkPassword(user.password, password);

    const token = user.token();

    return { user, token };
};

export const register = async ({
    email,
    password,
    confirmation,
}: {
    email: string;
    password: string;
    confirmation: string;
}): Promise<UserInstance> => {
    if (password !== confirmation) {
        throw new Http400Error('Password must match confirmation');
    }

    let user = await User.findOne({ email: email });
    if (user) {
        throw new Http409Error(`User with email ${email} already exists`);
    }

    user = await User.createNew({
        email,
        password,
    });

    const token = user.token();
    const confirmationUrl = joinUrl(config.siteUrl, `/verify/?token=${token}`);

    mailer.send(user.email, 'Email verification', 'email-verification', { confirmationUrl });

    return user;
};

export const resetPassword = async ({ email }: { email: string }): Promise<void> => {
    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Http404Error('User not found');
    }

    const token = user.token();
    const resetUrl = joinUrl(config.siteUrl, `/reset/?token=${token}`);

    await mailer.send(user.email, 'Password reset', 'password-reset', { resetUrl });
};

export const setResettedPassword = async ({
    token,
    password,
    confirmation,
}: {
    token: string;
    password: string;
    confirmation: string;
}): Promise<void> => {
    try {
        const user = await User.setNewPassword(token, password, confirmation);

        if (!user.confirmedAt) {
            user.confirmedAt = new Date();
        }

        await user.save();
    } catch (error) {
        if (error.expired) {
            throw new Http419Error('Token expired');
        }
    }
};

export const verifyResetToken = async ({ token }: { token: string }): Promise<void> => {
    try {
        await User.verifyUser(token);
    } catch (error) {
        if (error.expired) {
            throw new Http419Error('Token expired');
        }

        if (error.alreadyConfirmed) {
            throw new Http409Error('User already confirmed');
        }

        throw new Http400Error('Invalid token');
    }
};
