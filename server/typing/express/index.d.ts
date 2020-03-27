declare namespace Express {
    export interface Request {
        token?: string;
        user: null | import('../../db/models/user').UserInstance;
    }
}
