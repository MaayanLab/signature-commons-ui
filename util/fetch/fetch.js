// Modified from https://github.com/marmelab/react-admin/blob/6fd9dd595ff01d8ad52f8eb8ec8f390c2dd31318/packages/ra-core/src/util/fetch.ts

import { HttpError } from 'react-admin';
import fetch from 'isomorphic-unfetch'

export const fetchJson = async (url, options = {}) => {
    const requestHeaders = (options.headers ||
        new Headers({
            Accept: 'application/json',
        }))
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

    if (response.ok !== true)
        throw new Error(`Error communicating with API at ${base_url}${endpoint}`)

    const {status, statusText, headers} = response
    const body = await response.text()
    const json = JSON.parse(body)

    if (status < 200 || status >= 300){
        let errormessage = null
        if(json && json.error.message.errors){
            errormessage = statusText + ": " + json.error.message.errors[0].message
        }else if(json && json.error.message){
            errormessage = statusText + ": " + json.error.message
        }else if(json && json.error.name){
            errormessage = statusText + ": " + json.error.name
        }
        throw new HttpError(
                errormessage || statusText,
                status,
                json
              );
    }else {
      return Promise.resolve({ status, headers, body, json });
    }
};