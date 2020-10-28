import { UploadError } from 'utils/error-utils';
import { UNKNOWN_ERROR, UPLOAD_ABORTED, VALIDATION_ERROR } from 'utils/error-utils';

class FileUploader {
    _xhr;
    _url;
    _file;
    _onProgress;

    constructor({ file, url, onProgress }) {
        this._url = url;
        this._file = file;
        this._onProgress = onProgress;
    }

    upload = (accessToken) => {
        this._xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('uploadedFile', this._file);

        return new Promise((resolve, reject) => {
            this._xhr.addEventListener('load', () => {
                let errorDetail;
                try {
                    errorDetail = JSON.parse(this._xhr.response).detail;
                } catch {}

                if (errorDetail || this._xhr.status !== 200) {
                    const errorId = errorDetail ? VALIDATION_ERROR : UNKNOWN_ERROR;
                    reject(new UploadError({ errorId, details: errorDetail }));
                } else {
                    resolve();
                }
            });

            this._xhr.addEventListener('error', () => {
                reject(new UploadError({ errorId: UNKNOWN_ERROR }));
            });

            this._xhr.addEventListener('abort', () => {
                reject(new UploadError({ errorId: UPLOAD_ABORTED }));
            });

            this._xhr.upload.addEventListener('progress', (event) => {
                this._onProgress(event.loaded);
            });

            this._xhr.open('POST', this._url);
            this._xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
            this._xhr.send(formData);
        });

    }

    abort = () => {
        if (this._xhr) {
            this._xhr.abort();
        }
    }
}

export default FileUploader;
