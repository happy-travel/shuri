import React from 'react';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import propTypes from 'prop-types';
import View from 'matsumoto/src/stores/view-store';
import { Loader } from 'matsumoto/src/simple';
import UI from 'stores/shuri-ui-store';
import EntitiesStore from 'stores/shuri-entities-store';
import Menu from 'parts/menu'
import Dropzone from 'parts/uploads/dropzone';
import UploadModal from 'parts/uploads/upload-modal';
import {
    ACCOMMODATIONS_PATH,
    API_BASE_PATH,
    getAccommodation,
    getAccommodationPhotos,
    removeAccommodationPhoto
} from 'providers/api';
import UploadManager from 'managers/upload-manager';
import { UPLOAD_ABORTED } from 'utils/error-utils'

const MAX_PHOTO_SIZE = 50 * 1024 * 1024;

@observer
class AccommodationPhotosPage extends React.Component {
    id = this.props.match.params.id;
    @observable accommodation;
    @observable photos = [];
    @observable uploadManager;
    @observable isRequestingApi = false;

    componentDidMount() {
        this.getData();
    }

    get uploadUrl() {
        return `${API_BASE_PATH}${ACCOMMODATIONS_PATH}/${this.id}/photo`;
    }

    @action
    getData = () => {
        const requestParams = { urlParams: { id: this.id } };
        getAccommodationPhotos(requestParams).then(this.getPhotosSuccess);
        if (EntitiesStore.hasAccommodation(this.id)) {
            this.accommodation = EntitiesStore.getAccommodation(this.id);
        } else {
            getAccommodation(requestParams).then(this.getAccommodationSuccess);
        }
    }

    @action
    getPhotosSuccess = (photos) => {
        this.photos = photos;
    }

    @action
    getAccommodationSuccess = (accommodation) => {
        this.accommodation = accommodation;
        EntitiesStore.setAccommodation(accommodation);
    }

    uploadFiles = () => {
        this.uploadManager.uploadFiles().then(this.onUploadFinish, this.uploadFilesFail);
    }

    uploadFilesFail = (error) => {
        if (error?.data.errorId === UPLOAD_ABORTED) {
            this.onUploadFinish(this.props.t('Some photos were uploaded'));
        }
    }

    onUploadFinish = (message) => {
        if (this.uploadManager?.didUploadFiles) {
            getAccommodationPhotos({ urlParams: { id: this.id } })
                .then(this.getPhotosSuccess)
                .then(() => {
                    if (message) {
                        View.setTopAlertText(message);
                    }
                });
        }
        this.uploadManager = undefined;
    }

    @action
    onDrop = (files) => {
        this.uploadManager = new UploadManager(files, this.uploadUrl);
    }

    @action
    onCloseModal = () => {
        this.onUploadFinish(this.props.t('Some photos were uploaded'));
    }

    @action
    onAbort = () => {
        setTimeout(this.uploadManager.abort());
    }

    @action
    onPhotoRemoveClick = (event, photoId) => {
        event.preventDefault();
        this.isRequestingApi = true;
        removeAccommodationPhoto({
            urlParams: {
                accommodationId: this.id,
                photoId
            }
        }).then(() => this.removeAccommodationPhotoSuccess(photoId)).finally(this.removeAccommodationPhotoFinally);
    }

    @action
    removeAccommodationPhotoSuccess = (photoId) => {
        this.photos = this.photos.filter((photo) => photo.id !== photoId);
        View.setTopAlertText(this.props.t('The photo was removed'))
    }

    @action
    removeAccommodationPhotoFinally = () => {
        this.isRequestingApi = false;
    }

    renderPhoto = (photo) => {
        return (
            <a
                key={photo.id}
                className="photo-container"
                href={photo.largeImageURL}
                target="_blank"
                rel="noreferrer"
            >
                <div
                    className={'controls' + __class(this.isRequestingApi, 'disabled')}
                    onClick={!this.isRequestingApi ? (event) => this.onPhotoRemoveClick(event, photo.id) : undefined}
                >
                    <span className="icon remove" />
                </div>
                <img
                    className="image"
                    src={photo.smallImageURL}
                />
            </a>
        );
    }

    renderDropzone = () => {
        return (
            <Dropzone
                className="dropzone"
                accept=".jpeg,.jpg,image/jpeg"
                maxSize={MAX_PHOTO_SIZE}
                onDrop={this.onDrop}
            >
               <span className="icon camera"/>
            </Dropzone>
        );
    }

    renderGallery = () => {
        const { t } = this.props;
        return (
            <>
                <div>
                    {__plural(t, this.photos.length, t('photo'))}
                </div>
                <div className="photos-gallery">
                    {this.photos.map(this.renderPhoto)}
                    {this.renderDropzone()}
                </div>
            </>
        );
    }

    renderUploadModal = () => {
        if (!this.uploadManager) {
            return null;
        }

        return (
            <UploadModal
                uploadManager={this.uploadManager}
                uploadFiles={this.uploadFiles}
                onCloseClick={this.uploadManager.isResolved ? this.onCloseModal : this.onAbort}
            />
        );
    }

    render() {
        const isLoading = this.accommodation === undefined;

        return (
            <div className="settings block accommodation-photos">
                <Menu match={this.props.match} />
                <section>
                    {isLoading ?
                        <Loader /> :
                        <>
                            <h2 className="photos-header">
                                <span className="brand">
                                    {this.accommodation.name[UI.editorLanguage] + ' ' + this.props.t('Photos')}
                                </span>
                            </h2>
                            {this.renderGallery()}
                            {this.renderUploadModal()}
                        </>
                    }
                </section>
            </div>
        );
    }
}

AccommodationPhotosPage.propTypes = {
    t: propTypes.func,
    match: propTypes.object
}

export default withTranslation()(AccommodationPhotosPage);
