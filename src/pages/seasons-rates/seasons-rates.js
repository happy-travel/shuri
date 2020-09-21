import React from 'react';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { Loader } from 'matsumoto/src/simple';
import Table from 'matsumoto/src/components/external/table';
import UI from 'stores/shuri-ui-store';
import { getRates, getSeasons, removeRate, createRate, getContractAccommodations, getContract } from 'providers/api';
import DialogModal from 'parts/dialog-modal';
import RateCreateModal from 'pages/seasons-rates/rate-create-modal';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';

@observer
class SeasonsRates extends React.Component {
    contractId = this.props.match.params.id;
    tableColumns;
    @observable contract;
    @observable seasonsList;
    @observable accommodationsList;
    @observable ratesList;
    @observable ratesTree;
    @observable removingRate;
    @observable isRequestingApi = false;
    @observable isCreateModalShown = false;

    @computed
    get seasonsNames() {
        return new Map(this.seasonsList.map((season) => [season.id, season.name]));
    }

    @computed
    get seasonsOptions() {
        return this.seasonsList.map((season) => ({
            value: season.id,
            text: season.name
        }));
    }

    @computed
    get roomsNames() {
        const roomsNames = new Map();
        this.accommodationsList.forEach((accommodation) => {
            accommodation.roomIds?.forEach((roomId) => {
                roomsNames.set(roomId, `${accommodation.name[UI.editorLanguage]} (room #${roomId})`);
            });
        });
        return roomsNames;
    }

    @computed
    get roomsOptions() {
        return Array.from(this.roomsNames.entries()).map(([id, name]) => ({
            value: id,
            text: name
        }));
    }

    componentDidMount() {
        const { t } = this.props;
        this.tableColumns = [
            {
                Header: t('Price'),
                accessor: 'price'
            },
            {
                Header: t('Board basis plan'),
                accessor: 'boardBasisType',
                Cell: (item) => t(item.cell.value)
            },
            {
                Header: t('Details'),
                accessor: 'details',
                Cell: (item) => item.cell.value[UI.editorLanguage]
            },
            {
                Header: t('Room type'),
                accessor: 'roomType'
            },
            {
                Header: '',
                sortable: false,
                accessor: 'id',
                Cell: this.renderIdColumn
            }
        ];
        this.getData();
    }

    getData = () => {
        const requestParams = { urlParams: { id: this.contractId } };
        Promise.all([
            getContract(requestParams),
            getRates(requestParams),
            getSeasons(requestParams),
            getContractAccommodations(requestParams)
        ]).then(this.getDataSuccess);
    }

    @action
    getDataSuccess = ([contract, ratesList, seasonsList, accommodationsList]) => {
        this.contract = contract;
        this.seasonsList = seasonsList;
        this.accommodationsList = accommodationsList;
        this.ratesList = ratesList;
        this.ratesTree = getRatesTree(this.ratesList);
    }

    @action
    setRequestingApiStatus = () => {
        this.isRequestingApi = true;
    }

    @action
    unsetRequestingApiStatus = () => {
        this.isRequestingApi = false;
    }

    @action
    setRemovingRate = (rate) => {
        this.removingRate = rate;
    }

    @action
    unsetRemovingRate = () => {
        this.removingRate = undefined;
    }

    @action
    showCreateModal = () => {
        this.isCreateModalShown = true;
    }

    @action
    hideCreateModal = () => {
        this.isCreateModalShown = false;
    }

    @action
    onSeasonClick = (seasonId) => {
        const isExpanded = this.ratesTree.get(seasonId).isExpanded;
        this.ratesTree.get(seasonId).isExpanded = !isExpanded;
    }

    @action
    onRoomClick = (seasonId, roomId) => {
        const isExpanded = this.ratesTree.get(seasonId).data.get(roomId).isExpanded;
        this.ratesTree.get(seasonId).data.get(roomId).isExpanded = !isExpanded;
    }

    onRemoveClick = () => {
        this.setRequestingApiStatus();
        removeRate({
            urlParams: { id: this.contractId },
            body: [this.removingRate.id]
        }).then(this.onRemoveClickSuccess).finally(this.onRemoveClickFinally);
    }

    @action
    onRemoveClickSuccess = () => {
        const { id, seasonId, roomId } = this.removingRate;
        this.ratesList = this.ratesList.filter((rate) => rate.id !== id);
        const branch = this.ratesTree.get(seasonId).data.get(roomId).data;
        const newBranch = branch.filter((rate) => rate.id !== id)
        this.ratesTree.get(seasonId).data.get(roomId).data = newBranch;
        if (newBranch.length === 0) {
            this.ratesTree.get(seasonId).data.delete(roomId);
        }
        if (this.ratesTree.get(seasonId).data.size === 0) {
            this.ratesTree.delete(seasonId);
        }
    }

    onRemoveClickFinally = () => {
        this.unsetRemovingRate();
        this.unsetRequestingApiStatus();
    }

    onCreateClick = (values) => {
        this.setRequestingApiStatus();
        createRate({
            urlParams: {
                id: this.contractId
            },
            body: [{ ...values, price: Number(values.price) }]
        }).then(this.onCreateClickSuccess).finally(this.unsetRequestingApiStatus);
    }

    onCreateClickSuccess = () => {
        this.hideCreateModal();
        this.getData();
    }

    renderIdColumn = (item) => {
        const rate = this.ratesList.find((rate) => rate.id === item.row.original.id);
        return (
            <span
                onClick={() => this.setRemovingRate(rate)}
                className="icon icon-action-cancel remove-icon"
            />
        );
    }

    renderBreadcrumbs = () => {
        const { t } = this.props;
        return (
            <Breadcrumbs
                backLink={`/contract/${this.contractId}`}
                items={[
                    {
                        text: t('Contracts'),
                        link: '/contracts'
                    },
                    {
                        text: this.contract.name || `Contract #${this.contractId}`,
                        link: `/contract/${this.contractId}`
                    },
                    {
                        text: t('Rates')
                    }
                ]}
            />
        );
    }

    renderHeader = () => {
        const { t } = this.props;
        return (
            <h2>
                <div className="add-new-button-holder">
                    <button className="button small" onClick={this.showCreateModal}>
                        {t('Add rate')}
                    </button>
                </div>
                <span className="brand">
                    {t('Seasons Rates')}
                </span>
            </h2>
        );
    }

    renderRatesTable = (data) => {
        return (
            <div className="table-container">
                <Table
                    data={data}
                    columns={this.tableColumns}
                    pageIndex={0}
                    pageSize={data.length}
                    manualPagination
                />
            </div>
        );
    }

    renderRoom = (seasonId, [roomId, { isExpanded, data }]) => {
        const arrowClassName = isExpanded ? 'icon icon-arrow-expand-rotate' : 'icon icon-arrow-expand'
        return (
            <>
                <div
                    key={seasonId + roomId}
                    className="tree-header rooms-subheader"
                    onClick={() => this.onRoomClick(seasonId, roomId)}
                >
                    <span className={arrowClassName} />
                    {this.roomsNames.get(roomId)}
                </div>
                {isExpanded ? this.renderRatesTable(data) : null}
            </>
        )
    }

    renderSeason = (seasonId) => {
        const seasonBranch = this.ratesTree.get(seasonId);
        const isExpanded = seasonBranch.isExpanded;
        const seasonData = Array.from(seasonBranch.data);
        const arrowClassName = isExpanded ? 'icon icon-arrow-expand-rotate' : 'icon icon-arrow-expand';

        return (
            <>
                <div
                    key={seasonId}
                    className="tree-header"
                    onClick={() => this.onSeasonClick(seasonId)}
                >
                    <span className={arrowClassName} />
                    {this.seasonsNames.get(seasonId)}
                </div>
                {isExpanded ? seasonData.map((roomId) => this.renderRoom(seasonId, roomId)) : null}
            </>
        );
    }

    renderSeasons = () => {
        const { t } = this.props;
        if (this.ratesTree === undefined) {
            return <Loader />;
        }

        if (this.ratesTree.size === 0) {
            return <div>{t('No rates')}</div>;
        }

        return (
            Array.from(this.ratesTree.keys()).map(this.renderSeason)
        );
    }

    renderModals = () => {
        const { t } = this.props;
        return (
            <>
                {this.removingRate ?
                    <DialogModal
                        title={t('Removing rate')}
                        text={t('Are you sure you want to proceed and remove season rate?')}
                        onNoClick={this.unsetRemovingRate}
                        onYesClick={!this.isRequestingApi ? this.onRemoveClick : undefined}
                    /> :
                    null
                }
                {this.isCreateModalShown ?
                    <RateCreateModal
                        roomsOptions={this.roomsOptions}
                        seasonsOptions={this.seasonsOptions}
                        onCreate={this.onCreateClick}
                        onClose={this.hideCreateModal}
                    /> :
                    null
                }
            </>
        );
    }

    render() {
        if (this.contract === undefined) {
            return <Loader />;
        }
        return (
            <>
                <div className="settings block">
                    <section>
                        {this.renderBreadcrumbs()}
                        {this.renderHeader()}
                        {this.renderSeasons()}
                    </section>
                </div>
                {this.renderModals()}
            </>
        );
    }
}

function getRatesTree(ratesList) {
    const ratesTree = new Map();
    ratesList.forEach((rate) => {
        const { seasonId, roomId } = rate;
        const roomsMap = ratesTree.get(seasonId)?.data;
        if (!roomsMap) {
            ratesTree.set(
                seasonId,
                {
                    isExpanded: false,
                    data: new Map([[roomId, {
                        isExpanded: false,
                        data: [rate]
                    }]])
                }
            );
        } else if (!roomsMap.has(roomId)) {
            roomsMap.set(
                roomId,
                {
                    isExpanded: false,
                    data: [rate]
                }
            );
        } else {
            roomsMap.get(roomId).data.push(rate);
        }
    });
    return ratesTree;
}

SeasonsRates.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(SeasonsRates);
