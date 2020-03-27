import { Dictionary } from '../typing/generics';

export abstract class HttpError extends Error {
    public readonly statusCode!: number;
    public readonly name!: string;
    public readonly payload!: Dictionary;

    protected defaultMessage!: string;

    protected constructor(payload: Dictionary | string) {
        if (typeof payload === 'string') {
            super(payload);
        } else {
            this.payload = {
                success: false,
                ...payload,
            };

            if (payload.message) {
                super(payload.message);
            } else {
                super(this.defaultMessage);
            }
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

    public constructor(payload: Dictionary | string) {
        super(payload);
    }
}

export class Http404Error extends HttpError {
    public readonly statusCode = 404;
    protected defaultMessage = 'Not found';

    public constructor(payload: Dictionary | string) {
        super(payload);
    }
}

export class Http401Error extends HttpError {
    public readonly statusCode = 401;
    protected defaultMessage = 'Unauthorized';

    public constructor(payload: Dictionary | string) {
        super(payload);
    }
}

export class Http403Error extends HttpError {
    public readonly statusCode = 403;
    protected defaultMessage = 'Forbidden';

    public constructor(payload: Dictionary | string) {
        super(payload);
    }
}

export class Http409Error extends HttpError {
    public readonly statusCode = 409;
    protected defaultMessage = 'Conflict';

    public constructor(payload: Dictionary | string) {
        super(payload);
    }
}

export class Http419Error extends HttpError {
    public readonly statusCode = 419;
    protected defaultMessage = 'Expired';

    public constructor(payload: Dictionary | string) {
        super(payload);
    }
}