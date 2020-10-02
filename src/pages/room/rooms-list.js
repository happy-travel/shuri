import React from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import Table from 'matsumoto/src/components/table';
import UI from 'stores/shuri-ui-store';
import { Link, Redirect } from 'react-router-dom';
import DialogModal from 'parts/dialog-modal';
import propTypes from 'prop-types';
import {
    getAccommodation,
    getAccommodationRooms,
    removeAccommodationRooms
} from 'providers/api';

@observer
class RoomsList extends React.Component {
    @observable roomsList;
    @observable accommodation;
    @observable redirect;
    @observable isRemoveModalShown = false;
    @observable isRequestingApi = false;
    @observable accommodationId = this.props.match.params.accommodationId;

    constructor(props) {
        super(props);
        const { t } = this.props;

        this.tableColumns = [
            {
                header: t('Id'),
                cell: 'id'
            },
            {
                header: t('Name'),
                cell: (item) => item.name[UI.editorLanguage]
            },
            {
                header: t('Description'),
                cell: (item) => item.description[UI.editorLanguage]
            }
        ];
    }

    componentDidMount() {
        Promise.all([
            getAccommodation({
                urlParams: {
                    id: this.accommodationId
                }
            }),
            getAccommodationRooms({
                urlParams: {
                    accommodationId: this.accommodationId
                }
            })
        ]).then(this.getDataSuccess);
    }

    get roomsIds() {
        return this.roomsList?.map((room) => room.id);
    }

    @action
    getDataSuccess = ([accommodation, roomsList]) => {
        this.accommodation = accommodation;
        this.roomsList = roomsList;
    }

    @action
    setRedirectUrl = () => {
        this.redirectUrl = `/accommodation/${this.accommodationId}`;
    }

    @action
    setRequestingApiStatus = () => {
        this.isRequestingApi = true;
    }

    @action
    unsetRequestingApiStatus = () => {
        this.isRequestingApi = false;
    }

    onRoomsRemove = () => {
        this.setRequestingApiStatus();
        removeAccommodationRooms({
            urlParams: {
                accommodationId: this.accommodationId
            },
            body: this.roomsIds
        }).then(this.setRedirectUrl, this.unsetRequestingApiStatus);
    }

    @action
    onOpenRemoveModal = () => {
        this.isRemoveModalShown = true;
    }

    @action
    onCloseRemoveModal = () => {
        this.isRemoveModalShown = false;
    }

    renderBreadcrumbs = () => {
        const { t } = this.props;
        return (
            <Breadcrumbs
                backLink={`/accommodation/${this.accommodationId}`}
                items={[
                    {
                        text: t('Accommodations'),
                        link: '/'
                    }, {
                        text: this.accommodation?.name[UI.editorLanguage] || `Accommodation #${this.accommodationId}`,
                        link: `/accommodation/${this.accommodationId}`
                    }, {
                        text: t('Rooms')
                    }
                ]}
            />
        );
    }

    renderContent = () => {
        const { t } = this.props;
        return (
            <Table
                list={this.roomsList}
                columns={this.tableColumns}
                textEmptyResult={t('No rooms found')}
                textEmptyList={t('No rooms added')}
                onRowClick={(item) =>
                    this.redirect = `/accommodation/${this.accommodationId}/room/${item.id}`
                }
            />
        );
    }

    render() {
        if (this.redirect) {
            return <Redirect push to={this.redirect}/>;
        }

        const { t } = this.props;
        return (
            <>
                <div className="settings block">
                    <section>
                        {this.renderBreadcrumbs()}
                        <h2>
                            <div className="add-new-button-holder">
                                <Link to={`/accommodation/${this.accommodationId}/room`}>
                                    <button className="button small">
                                        Add new room
                                    </button>
                                </Link>
                                {/*<button*/}
                                {/*    type="button"*/}
                                {/*    disabled={!this.roomsList?.length}*/}
                                {/*    onClick={this.onOpenRemoveModal}*/}
                                {/*    className="button small gray remove-button"*/}
                                {/*>*/}
                                {/*    {t('Remove rooms')}*/}
                                {/*</button>*/}
                            </div>
                            <span className="brand">
                                {`Rooms list In Accommodation #${this.accommodationId}`}
                            </span>
                        </h2>
                        {this.renderContent()}
                    </section>
                </div>
                {this.isRemoveModalShown ?
                    <DialogModal
                        title={t('Removing rooms')}
                        text={t('Are you sure you want to proceed?')}
                        onNoClick={this.onCloseRemoveModal}
                        onYesClick={!this.isRequestingApi ? this.onRoomsRemove : undefined}
                    /> :
                    null
                }
            </>
        );
    }
}

RoomsList.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(RoomsList);
