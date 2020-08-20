import { API } from 'matsumoto/src/core';

function apiPromise({ url, body = {}, method = 'GET' }) {
    return new Promise((resolve, reject) => API[method.toLowerCase()]({
        url,
        body,
        success: (result) => resolve(result),
        error: (error) => reject(error)
    }))
}

export default apiPromise;
