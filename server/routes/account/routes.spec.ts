import { expect } from 'chai';
import { SuperTest, Test, agent } from 'supertest';

import { runApp } from '../../server';

describe('Account router', () => {
    let app: SuperTest<Test>;

    before(async () => {
        const expressApp = await runApp();
        app = agent(expressApp);
    });

    it("shouldn't login under not existing account", async () => {
        const res = await app.post('/api/v1/account/login');

        expect(res).to.have.nested.property('body.success').to.be.false;
        expect(res).to.have.nested.property('body.message').to.be.equal('User not found');
    });

    it("shouldn't login not activated user", async () => {
        // fixture.createUser({ active: false })

        throw new Error('Not implemented');
    });

    it("shouldn't login with wrong credentials", async () => {
        // fixture.createUser({ active: true, confirmedAt: new Date() })

        throw new Error('Not implemented');
    });

    it('should able to register user', async () => {
        throw new Error('Not implemented');
    });

    it('should able verify registered user by token from email', async () => {
        throw new Error('Not implemented');
    });

    it('should able to reset password', async () => {
        throw new Error('Not implemented');
    });

    it('should able to set new password by token from email', async () => {
        throw new Error('Not implemented');
    });
});
