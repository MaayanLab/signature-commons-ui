import fetch from 'isomorphic-unfetch'

export const base_url = process.env.NEXT_SERVER_EXTERNAL_API
    || process.env.NEXT_STATIC_EXTERNAL_API
    || process.env.NEXT_PUBLIC_EXTERNAL_API


export async function fetch_external({endpoint, body, signal, headers}) {
    const start = new Date()
    let duration
    if ( base_url === undefined ){
        duration = (new Date() - start) / 1000
        return {
            response: {},
            duration
        }
    } 
    
    const request = await fetch(
        base_url
        + (endpoint === undefined ? '' : endpoint)
        + (body === undefined ? '' : "?" + body),
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 'Authorization': auth,
                ...(headers || {}),
              },
            signal: signal,
        }
    )

    if (request.ok !== true) {
        throw new Error(`Error communicating with API at ${base_url}${endpoint}`)
    }
    const response = await request.json()
    duration = request.headers.get('X-Duration')
    if (duration !== null) {
        duration = Number(request.headers.get('X-Duration'))
    } else {
        duration = (new Date() - start) / 1000
    }
    return { response, duration}
}



export async function fetch_external_post({endpoint, body, signal, headers}) {
    const start = new Date()
    let duration
    if ( base_url === undefined ){
        duration = (new Date() - start) / 1000
        return {
            response: {},
            duration
        }
    } 
    
    const request = await fetch(
        base_url
        + (endpoint === undefined ? '' : endpoint),
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // 'Authorization': auth,
                ...(headers || {}),
              },
            signal: signal,
        }
    )

    if (request.ok !== true) {
        throw new Error(`Error communicating with API at ${base_url}${endpoint}`)
    }
    const response = await request.json()
    duration = request.headers.get('X-Duration')
    if (duration !== null) {
        duration = Number(request.headers.get('X-Duration'))
    } else {
        duration = (new Date() - start) / 1000
    }
    return { response, duration}
}