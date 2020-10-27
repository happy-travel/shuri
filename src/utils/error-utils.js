const UPLOAD_ABORTED = 'UPLOAD_ABORTED';
const UNKNOWN_ERROR = 'UNKNOWN_ERROR';
const VALIDATION_ERROR = 'VALIDATION_ERROR';

class UploadError extends Error {
    constructor(data = {}, message = '') {
        super(message);
        this.data = data;
        this.name = 'UploadError';
    }
}

function lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function parseBackendErrors(errorData) {
    const errorDetails = errorData.detail;
    const errorsObject = errorData.errors;
    if (errorDetails) {
        return errorDetails.split(', ').map((errorString) => {
            const errorData = errorString.split(': ');
            const path = errorData[0].split('.').map(lowerFirstLetter).join('.');
            const message = errorData[1] || '';
            return { path, message };
        });
    } else if (errorsObject) {
        return Object.keys(errorsObject).map((errorKey) => ({
            path: errorKey.split('.').map(lowerFirstLetter).join('.'),
            message: errorsObject[errorKey][0]
        }))
    } else {
        return [];
    }
}

export {
    UPLOAD_ABORTED,
    UNKNOWN_ERROR,
    VALIDATION_ERROR,
    UploadError,
    lowerFirstLetter,
    parseBackendErrors
};
