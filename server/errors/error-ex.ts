import { Dictionary } from '@server/typing/generics';

export interface ErrorData extends Dictionary {
    code?: number;
    message: string;
}

export class ErrorEx extends Error implements Dictionary {
    [key: string]: any;

    constructor(data: string | ErrorData) {
        if (typeof data === 'string') {
            super(data);
        } else {
            Object.keys(data).forEach((key) => (this[key] = data[key]));

            super(data.message);
        }
    }
}
