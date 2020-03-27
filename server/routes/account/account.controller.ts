import config from '@server/config';
import User, { UserInstance } from '@server/db/models/user';
import { Http400Error, Http403Error, Http404Error, Http409Error } from '@server/errors/http-errors';
import { joinUrl } from '@server/libs/join-url';
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

    await user.checkPassword(password);

    const token = user.generateToken();

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
        throw new Http400Error('PAssword must match confirmation');
    }

    let user = await User.findOne({ email: email });
    if (user) {
        throw new Http409Error(`User with email ${email} already exists`);
    }

    user = await User.createNew({
        email,
        password,
    });

    const token = user.generateToken();
    const confirmationUrl = joinUrl(config.siteUrl, `/verify/?token=${token}`);

    mailer.send(user.email, 'Email verification', 'email-verification', { confirmationUrl });

    return user;
};
