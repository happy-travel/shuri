import React from 'react';
import propTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import {
    CachedForm,
    FieldText
} from 'matsumoto/src/components/form';
import Menu from 'parts/menu';
import UI from 'stores/shuri-ui-store';
import EntitiesStore from 'stores/shuri-entities-store';
import DialogModal from 'parts/dialog-modal';
import {
    createAccommodationRoom, getAccommodation,
    getAccommodationRoom,
    removeAccommodationRoom,
    updateAccommodationRoom
} from 'providers/api';
import { Loader } from 'matsumoto/src/simple';

const DEFAULT_ROOM = {
    name: { [UI.editorLanguage]: '' },
    description: { [UI.editorLanguage]: '' },
    amenities: { [UI.editorLanguage]: [] },
    pictures: {}
};

@observer
class RoomPage extends React.Component {
    @observable room;
    @observable id = this.props.match.params.id;
    @observable accommodationId = this.props.match.params.accommodationId;
    @observable redirectUrl;
    @observable isRequestingApi = false;
    @observable isRemoveModalShown = false;

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        const prevId = prevProps.match.params.id;
        const id = this.props.match.params.id;

        if (prevId !== id) {
            this.id = id;
            this.loadData();
        }
    }

    @action
    loadData = () => {
        getAccommodation({ urlParams: { id: this.accommodationId } }).then(this.getAccommodationSuccess);

        if (!this.id) {
            this.room = DEFAULT_ROOM;
        } else if (EntitiesStore.hasRoom(this.accommodationId, this.id)) {
            this.room = EntitiesStore.getRoom(this.accommodationId, this.id);
        } else {
            getAccommodationRoom({
                urlParams: {
                    accommodationId: this.accommodationId,
                    roomId: this.id
                }
            }).then(this.getAccommodationRoomSuccess);
        }
    }

    getAccommodationSuccess = (accommodation) => {
        EntitiesStore.setAccommodation(accommodation);
    }

    @action
    getAccommodationRoomSuccess = (room) => {
        this.room = room;
        EntitiesStore.setRoom(this.accommodationId, room);
    }

    @action
    setRedirectUrl = () => {
        this.redirectUrl = `/accommodation/${this.accommodationId}/rooms`;
    }

    @action
    setRequestingApiStatus = () => {
        this.isRequestingApi = true;
    }

    @action
    unsetRequestingApiStatus = () => {
        this.isRequestingApi = false;
    }

    reformatValues = (values) => {
        if (!values.occupancyConfigurations) {
            values.occupancyConfigurations = [
                {
                    adults: 2,
                    teenagers: 1,
                    children: 0,
                    infants: 0
                }
            ];
        }

        return values;
    }

    @action
    onOpenRemoveModal = () => {
        this.isRemoveModalShown = true;
    }

    @action
    onCloseRemoveModal = () => {
        this.isRemoveModalShown = false;
    }

    onRoomRemove = () => {
        this.setRequestingApiStatus();
        removeAccommodationRoom({
            urlParams: {
                accommodationId: this.accommodationId,
                roomId: this.id
            }
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    onCreateSubmit = (values) => {
        if (this.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        createAccommodationRoom({
            urlParams: {
                accommodationId: this.accommodationId
            },
            body: [this.reformatValues(values)]
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    onUpdateSubmit = (values) => {
        if (this.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        updateAccommodationRoom({
            urlParams: {
                accommodationId: this.accommodationId,
                roomId: this.id
            },
            body: this.reformatValues(values)
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    renderForm = (formik) => {
        const { t } = this.props;
        return (
            <div className="form app-settings">
                <div className="row">
                    <FieldText formik={formik} clearable
                        id={`name.${UI.editorLanguage}`}
                        label="Name"
                        placeholder="Enter room name"
                    />
                </div>
                <div className="row">
                    <FieldText formik={formik} clearable
                        id={`description.${UI.editorLanguage}`}
                        label="Description"
                        placeholder="Enter room description"
                    />
                </div>
                <div className="row controls">
                    <div className="field">
                        <div className="row">
                            <button
                                type="submit"
                                className="button"
                            >
                                {this.id ? t('Save changes') : 'Create room'}
                            </button>
                            {this.id ?
                                <button
                                    type="button"
                                    onClick={this.onOpenRemoveModal}
                                    className="button gray remove-button"
                                >
                                    {t('Remove room')}
                                </button> :
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { t } = this.props;
        const isLoading = this.room === undefined;

        if (this.redirectUrl) {
            return <Redirect push to={this.redirectUrl} />;
        }

        return (
            <>
                <div className="settings block">
                    <Menu match={this.props.match} />
                    <section>
                        {isLoading ?
                            <Loader /> :
                            <>
                                <h2>
                                    <span className="brand">
                                        {this.id ? `Edit room #${this.id}` : 'Create new room'}
                                    </span>
                                </h2>
                                <CachedForm
                                    initialValues={this.room}
                                    onSubmit={this.id ? this.onUpdateSubmit : this.onCreateSubmit}
                                    render={this.renderForm}
                                    enableReinitialize
                                />
                            </>
                        }
                    </section>
                </div>
                {this.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing room')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.onCloseRemoveModal}
                        onYesClick={!this.isRequestingApi ? this.onRoomRemove : undefined}
                    /> :
                    null
                }
            </>
        );
    }
}

RoomPage.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(RoomPage);
