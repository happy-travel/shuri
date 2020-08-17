import React from 'react';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { API } from 'matsumoto/src/core';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import Table from 'matsumoto/src/components/external/table';
import apiMethods from 'core/methods';
import UIStore from 'stores/shuri-ui-store';
import { Link, Redirect } from 'react-router-dom';
import { Loader } from 'matsumoto/src/simple';
import DialogModal from 'parts/dialog-modal';
import propTypes from 'prop-types';

const PAGE_SIZE = 10;

@observer
class RoomsList extends React.Component {
    @observable roomsList = null;
    @observable tablePageIndex = 0;
    @observable tableColumns;
    @observable isRemoveModalShown = false;
    @observable redirectUrl = undefined;

    constructor(props) {
        super(props);
        const { t } = this.props;
        this.state = {
            accommodationId: this.props.match.params.accommodationId
        };

        this.tableColumns = [
            {
                Header: 'Room Id',
                accessor: 'id'
            },
            {
                Header: t('name'),
                accessor: 'name',
                Cell: (item) => item.cell.value[UIStore.editorLanguage]
            },
            {
                Header: 'Actions',
                accessor: 'id',
                Cell: (item) => (
                    <Link to={`/accommodation/${this.state.accommodationId}/room/${item.cell.value}`}>
                        <span className="icon icon-action-pen-orange"/>
                    </Link>
                )
            }
        ];
    }

    componentDidMount() {
        API.get({
            url: apiMethods.roomsList(this.state.accommodationId),
            success: (list) => this.roomsList = list
        });
    }

    get roomsIds() {
        return this.roomsList?.map((room) => room.id);
    }

    @action
    onRoomsRemove = () => {
        const { accommodationId } = this.state;
        this.isRequestingApi = true;
        API.delete({
            url: apiMethods.roomsList(accommodationId),
            body: this.roomsIds,
            success: runInAction(() => {
                this.redirectUrl = `/accommodation/${accommodationId}`;
            }),
            after: runInAction(() => {
                this.isRequestingApi = false;
            })
        })
    }

    @action
    onPaginationClick = ({ pageIndex }) => {
        this.tablePageIndex = pageIndex;
    }

    @action
    onOpenRemoveModal = () => {
        this.isRemoveModalShown = true;
    }

    @action
    onCloseRemoveModal = () => {
        this.isRemoveModalShown = false;
    }

    renderContent = () => {
        if (this.roomsList === null) {
            return <Loader />;
        }
        const tableData = this.roomsList.slice(
            PAGE_SIZE * this.tablePageIndex,
            PAGE_SIZE * (this.tablePageIndex + 1)
        );

        return this.roomsList.length ?
            <Table
                data={tableData}
                count={this.roomsList.length}
                fetchData={this.onPaginationClick}
                columns={this.tableColumns}
                pageIndex={this.tablePageIndex}
                pageSize={PAGE_SIZE}
                manualPagination
            /> :
            'No results';
    }

    render() {
        const { t } = this.props;
        const { accommodationId } = this.state;

        if (this.redirectUrl) {
            return <Redirect push to={this.redirectUrl} />;
        }

        return (
            <>
                <div className="settings block">
                    <section>
                        <Breadcrumbs
                            backLink={`/accommodation/${accommodationId}`}
                            items={[
                                {
                                    text: 'Accommodations list',
                                    link: '/'
                                }, {
                                    text: 'Accommodation',
                                    link: `/accommodation/${accommodationId}`
                                }, {
                                    text: 'Rooms list'
                                }
                            ]}
                        />
                        <h2>
                            <div className="add-new-button-holder">
                                <Link to={`/accommodation/${this.state.accommodationId}/room`}>
                                    <button className="button small">
                                        Add new room
                                    </button>
                                </Link>
                                <button
                                    type="button"
                                    disabled={!this.roomsList?.length}
                                    onClick={this.onOpenRemoveModal}
                                    className="button small gray remove-button"
                                >
                                    {t('Remove rooms')}
                                </button>
                            </div>
                            <span className="brand">
                                Rooms list In Accommodation #{this.state.accommodationId}
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
                        onYesClick={!this.state.isRequestingApi ? this.onRoomsRemove : undefined}
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
