import React from 'react';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import {
    CachedForm, FieldSelect,
    FieldText
} from 'matsumoto/src/components/form';
import Breadcrumbs from 'components/breadcrumbs';
import { API } from 'matsumoto/src/core';
import apiMethods from 'core/methods';
import UI from 'stores/shuri-ui-store';
import DialogModal from '../../parts/dialog-modal';

class RoomPage extends React.Component {
    state = {
        room: {
            "name": {"ar": "", "en": "", "ru": ""},
            "description": {"ar": "", "en": "", "ru": ""},
            "amenities": {"ar": [], "en": [], "ru": []},
            "pictures": {},
        },
        id: this.props.match.params.id,
        accommodationId: this.props.match.params.accommodationId,
        redirectUrl: undefined,
        isRequestingApi: false,
        isRemoveModalShown: false
    };

    componentDidMount() {
        const { id, accommodationId } = this.state;
        if (!id) {
            return;
        }

        API.get({
            url: apiMethods.roomsList(accommodationId),
            success: (rooms) => {
                rooms.forEach(item => {
                    if (item.id == id)
                        this.setState({ room: item });
                })
            }
        })
    }

    onOpenRemoveModal = () => {
        this.setState({
            isRemoveModalShown: true
        });
    }

    onCloseRemoveModal = () => {
        this.setState({
            isRemoveModalShown: false
        });
    }

    onRoomRemove = () => {
        this.setState({ isRequestingApi: true });
        API.delete({
            url: apiMethods.roomById(this.state.accommodationId, this.state.id),
            success: () => {
                this.setState({ redirectUrl: `/accommodation/${this.state.accommodationId}/rooms` });
            },
            after: () => {
                this.setState({ isRequestingApi: false })
            }
        })
    }

    submit = (values) => {
        const {
            id,
            accommodationId,
        } = this.state;
        const method = id ? 'put' : 'post';
        const url = id ?
            apiMethods.roomById(accommodationId, this.state.id) :
            apiMethods.roomsList(accommodationId);

        if (!values.occupancyConfigurations)
            values.occupancyConfigurations = [
                {
                    "adults": 2,
                    "teenagers": 1,
                    "children": 0,
                    "infants": 0
                }
            ];

        this.setState({ isRequestingApi: true });
        API[method]({
            url: url,
            body: [values],
            success: () => {
                this.setState({ redirectUrl: `/accommodation/${accommodationId}/rooms` });
            },
            after: () => {
                this.setState({ isRequestingApi: false })
            }
        })
    }

    renderForm = (formik) => {
        const { t } = this.props;
        const { id } = this.state;
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
                                {id ? t('Save changes') : 'Create room'}
                            </button>
                            {id ?
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
        const {
            redirectUrl,
            id,
            accommodationId,
        } = this.state;

        if (redirectUrl) {
            return <Redirect push to={redirectUrl} />;
        }

        return (
            <>
                <div className="settings block">
                    <section>
                        <Breadcrumbs
                            backLink={`/accommodation/${accommodationId}/rooms`}
                            items={[
                                {
                                    text: 'Accommodations list',
                                    link: '/'
                                }, {
                                    text: 'Accommodation',
                                    link: `/accommodation/${accommodationId}`
                                }, {
                                    text: 'Rooms list',
                                    link: `/accommodation/${accommodationId}/rooms`
                                }, {
                                    text: 'Room'
                                },
                            ]}
                        />
                        <h2>
                            <span className="brand">
                                {id ? `Edit room #${id}` : 'Create new room'}
                            </span>
                        </h2>
                        <CachedForm
                            initialValues={this.state.room}
                            onSubmit={!this.state.isRequestingApi ? this.submit : undefined}
                            render={this.renderForm}
                            enableReinitialize
                        />
                    </section>
                </div>
                {this.state.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing room')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.onCloseRemoveModal}
                        onYesClick={!this.state.isRequestingApi ? this.onRoomRemove : undefined}
                    /> :
                    null
                }
            </>
        );
    }
}

export default withTranslation()(RoomPage);
