import { API } from 'matsumoto/src/core';

function apiPromise({ url, body = {}, method = 'GET' }) {
    return new Promise((success, error) => API[method.toLowerCase()]({ url, body, success, error }))
}

export default apiPromise;
