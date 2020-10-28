import { action, observable, runInAction } from 'mobx';
import FileUploader from 'lib/file-uploader';
import { UploadError, UPLOAD_ABORTED } from 'utils/error-utils';
import { getAccessToken } from 'providers/auth';

class UploadManager {
    _isUploadSuccessful = true;
    _url;
    @observable didUploadFiles = false;
    @observable isResolved = false;
    @observable items;

    constructor(files, url) {
        this._url = url;
        this.items = files.map((file) => ({
            file,
            status: 'waiting',
            loadedBytes: 0
        }));
    }

    uploadFiles = async() => {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];

            runInAction(() => {
                item.status = 'uploading';
            });
            const onProgress = (loadedBytes) => this._onProgress(item, loadedBytes);
            const fileUploader = new FileUploader({
                file: item.file,
                url: this._url,
                onProgress
            });
            runInAction(() => {
                item.abort = fileUploader.abort;
            });
            try {
                const accessToken = await getAccessToken();
                await fileUploader.upload(accessToken);
                runInAction(() => {
                    item.status = 'upload-success';
                    this.didUploadFiles = true;
                });
            } catch (error) {
                if (error?.data.errorId === UPLOAD_ABORTED) {
                    throw error;
                }
                this._isUploadSuccessful = false;
                runInAction(() => {
                    item.error = error;
                    item.status = 'upload-fail';
                });
            }
        }

        runInAction(() => {
            this.isResolved = true;
        });
        if (!this._isUploadSuccessful) {
            throw new UploadError();
        }
    }

    @action
    _onProgress = (item, loadedBytes) => {
        item.loadedBytes = Math.min(item.file.size, loadedBytes);
    };

    @action
    abort = () => {
        this.items
            .filter((item) => item.status === 'uploading')
            .forEach((item) => item.abort());
    }
}

export default UploadManager;
