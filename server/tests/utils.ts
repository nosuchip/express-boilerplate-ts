export const randomString = (length?: number, alphabet?: string, prefix?: string, postfix?: string) => {
    length = length || 10;

    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    if (alphabet) {
        if (alphabet === 'hex') {
            characters = 'abcdef0123456789';
        } else if (alphabet === 'HEX') {
            characters = 'ABCDEF0123456789';
        } else if (alphabet === 'all') {
            // do nothing
        } else {
            characters = alphabet;
        }
    }

    let value = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        value += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    if (typeof prefix === 'undefined') {
        value = '____' + value;
    } else {
        value = prefix + value;
    }

    if (postfix) {
        value = value + postfix;
    }

    return value;
};

export const randomInteger = (min: number, max: number) => {
    min = min || 0;
    max = max || 1;

    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomHexColor = (prefixHash = false) => {
    let color = randomString(6, 'hex', '');

    if (prefixHash) {
        color = '#' + color;
    }

    return color;
};

export const randomEmail = (addressLength = 8, domainLength = 8) => {
    return (randomString(addressLength) + '@' + randomString(domainLength, 'all', '') + '.com').toLowerCase();
};

export const randomPhone = (prefixPlus = false) => {
    let value = randomInteger(555000000, 555999999).toString();

    if (prefixPlus) {
        value = '+' + value;
    }

    return value;
};

export const randomCoordinate = () => {
    return randomInteger(-80, 80) + '.' + randomInteger(0, 9999999);
};
