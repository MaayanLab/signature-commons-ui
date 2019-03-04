import { HttpError } from 'react-admin';
import { stringify } from 'query-string';

export async function fetchJson(url, options = {}) {
    const requestHeaders = (options.headers ||
        new Headers({
            Accept: 'application/json',
        }));
    if (
        !requestHeaders.has('Content-Type') &&
        !(options && options.body && options.body instanceof FormData)
    ) {
        requestHeaders.set('Content-Type', 'application/json');
    }
    //  We're already doing this in httpclient
    // if (options.user && options.user.authenticated && options.user.token) {
    //     requestHeaders.set('Authorization', options.user.token);
    // }

    const response = await fetch(url, { ...options, headers: requestHeaders })
    const text = await response.text()
    const status = response.status
    const statusText = response.statusText
    const headers = response.headers
    const body = text

    let json
    try {
        json = JSON.parse(body);
    } catch (e) {
        // not json, no big deal
    }

    if (status === 406) {
        let errormessage = null
        if (json) {
            errormessage = `${statusText}: ${json.error.message.errors[0].message}`
        }
        throw new HttpError(
            (json && errormessage) || statusText,
            status,
            json
        )
    } else if (status < 200 || status >= 300) {
        throw new HttpError(
            (json && json.message) || statusText,
            status,
            json
        )
    }
    
    return { status, headers, body, json }
};

export const queryParameters = stringify;

const isValidObject = value => {
    if (!value) {
        return false;
    }

    const isArray = Array.isArray(value);
    const isBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer(value);
    const isObject = value.toString() === '[object Object]';
    const hasKeys = !!Object.keys(value).length;

    return !isArray && !isBuffer && isObject && hasKeys;
};

export const flattenObject = (value, path = []) => {
    if (isValidObject(value)) {
        return Object.assign(
            {},
            ...Object.keys(value).map(key =>
                flattenObject(value[key], path.concat([key]))
            )
        );
    } else {
        return path.length ? { [path.join('.')]: value } : value;
    }
};