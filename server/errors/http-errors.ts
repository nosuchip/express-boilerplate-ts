import { Dictionary } from '../typing/generics';

interface ErrorPayload extends Dictionary {
    message?: string;
    statusCode?: number;
}

export abstract class HttpError extends Error {
    public readonly statusCode!: number;
    public readonly name!: string;
    public readonly payload!: Dictionary;

    protected defaultMessage!: string;

    protected constructor(payload: string | ErrorPayload) {
        super();

        if (typeof payload === 'string') {
            this.message = payload;
        } else {
            this.payload = { success: false, ...payload };
            this.statusCode = payload.statusCode || this.statusCode;
            this.message = payload.message || this.defaultMessage;
        }

        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    public json(): Dictionary {
        if (!this.payload) {
            return { success: false, message: this.message };
        }

        return this.payload;
    }
}

export class Http400Error extends HttpError {
    public readonly statusCode = 400;
    protected defaultMessage = 'Bad Request';

    public constructor(payload: string | ErrorPayload) {
        super(payload);
    }
}

export class Http404Error extends HttpError {
    public readonly statusCode = 404;
    protected defaultMessage = 'Not found';

    public constructor(payload: string | ErrorPayload) {
        super(payload);
    }
}

export class Http401Error extends HttpError {
    public readonly statusCode = 401;
    protected defaultMessage = 'Unauthorized';

    public constructor(payload: string | ErrorPayload) {
        super(payload);
    }
}

export class Http403Error extends HttpError {
    public readonly statusCode = 403;
    protected defaultMessage = 'Forbidden';

    public constructor(payload: string | ErrorPayload) {
        super(payload);
    }
}

export class Http409Error extends HttpError {
    public readonly statusCode = 409;
    protected defaultMessage = 'Conflict';

    public constructor(payload: string | ErrorPayload) {
        super(payload);
    }
}

export class Http419Error extends HttpError {
    public readonly statusCode = 419;
    protected defaultMessage = 'Expired';

    public constructor(payload: string | ErrorPayload) {
        super(payload);
    }
}
