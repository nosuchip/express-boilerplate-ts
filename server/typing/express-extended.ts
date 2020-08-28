import { IncomingHttpHeaders } from 'http';

import { Dictionary } from './generics';

export interface Req {
    body: Dictionary;
    query: Dictionary;
    headers: IncomingHttpHeaders;
}

export interface TokenReq extends Req {
    token: string;
}

export interface UserReq extends TokenReq {
    user: null | import('../db/models/user').UserInstance;
}
