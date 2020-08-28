import User, { Role } from '@server/db/models/user';
import { hashPassword } from '@server/libs/password';
import { randomEmail, randomString } from '@server/tests/utils';

import { login } from './account.controller';

describe('Account controller', () => {
    let user;
    let email: string;
    let password: string;
    let token: string;

    beforeEach(async () => {
        email = randomEmail();
        password = randomString();
        token = randomString();

        user = {
            email,
            password: await hashPassword(password),
            isActive: true,
            confirmedAt: new Date(),
            roles: [Role.Admin],
            createdAt: new Date(),
            updatedAt: new Date(),

            token: jest.fn(() => token),
        };

        User.findOne = jest.fn().mockResolvedValue(user);
    });

    it('should login user', async () => {
        const { user, token: generatedToken } = await login({ username: email, password });

        expect(token).toBeTruthy();
        expect(user).toBeTruthy();
        expect(user.email).toBe(email);
        expect(generatedToken).toBe(token);
    });
});
