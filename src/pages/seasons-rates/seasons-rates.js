import React from 'react';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import { Loader } from 'matsumoto/src/simple';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import UI from 'stores/shuri-ui-store';
import RateActionModal from 'pages/seasons-rates/rate-action-modal';
import { getRates, getSeasons, removeRate, createRate, getContractAccommodations, getContract } from 'providers/api';
import { getRatesTree } from 'utils/ui-utils';

@observer
class SeasonsRates extends React.Component {
    contractId = this.props.match.params.id;
    @observable contract;
    @observable seasonsList;
    @observable accommodationsList;
    @observable rateStub;
    @observable ratesList;
    @observable ratesTree;
    @observable activeRate;
    @observable isRequestingApi = false;

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
        this.ratesTree = getRatesTree(this.ratesList, this.seasonsList);
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
    setRateStub = (stub) => {
        this.rateStub = stub;
    }

    @action
    setActiveRate = (rate) => {
        this.activeRate = rate;
    }

    @action
    hideModal = () => {
        this.rateStub = undefined;
        this.activeRate = undefined;
    }

    @action
    onSeasonClick = (seasonId) => {
        const isExpanded = this.ratesTree.get(seasonId).isExpanded;
        this.ratesTree.get(seasonId).isExpanded = !isExpanded;
    }

    onRemoveClick = () => {
        if (this.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        removeRate({
            urlParams: { id: this.contractId },
            body: [this.activeRate.id]
        }).then(this.onRemoveClickSuccess).finally(this.onRemoveClickFinally);
    }

    @action
    onRemoveClickSuccess = () => {
        const { id, seasonId, roomId } = this.activeRate;
        this.ratesList = this.ratesList.filter((rate) => rate.id !== id);
        const branch = this.ratesTree.get(seasonId).data.get(roomId);
        const newBranch = branch.filter((rate) => rate.id !== id)
        this.ratesTree.get(seasonId).data.set(roomId, newBranch);
        if (newBranch.length === 0) {
            this.ratesTree.get(seasonId).data.delete(roomId);
        }
    }

    onRemoveClickFinally = () => {
        this.hideModal();
        this.unsetRequestingApiStatus();
    }

    onCreateClick = (values) => {
        if (this.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        createRate({
            urlParams: {
                id: this.contractId
            },
            body: [{ ...values, price: Number(values.price) }]
        }).then(this.onCreateClickSuccess).finally(this.unsetRequestingApiStatus);
    }

    onCreateClickSuccess = ([rate]) => {
        const { seasonId, roomId } = rate;
        this.ratesList.push(rate);
        const branch = this.ratesTree.get(seasonId);
        if (!branch) {
            this.ratesTree.set(
                seasonId,
                {
                    isExpanded: true,
                    data: new Map([[roomId, [rate]]])
                }
            );
        } else {
            branch.isExpanded = true;
            if (branch.data.has(roomId)) {
                branch.data.get(roomId).push(rate);
            } else {
                branch.data.set(roomId, [rate]);
            }
        }
        this.hideModal();
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
                <span className="brand">
                    {t('Seasons Rates')}
                </span>
            </h2>
        );
    }

    renderRate = (rate) => {
        const { t } = this.props;
        return (
            <div className="rate-info" onClick={() => this.setActiveRate(rate)}>
                <div>
                    {t(rate.roomType)}
                    <span className="bullet" />
                    {t(rate.boardBasisType)}
                </div>
                <div>
                    {rate.currency.toUpperCase()}&nbsp;{rate.price}
                </div>
            </div>
        );
    }

    renderRoom = (seasonId, roomId, data) => {
        const stub = { seasonId, roomId };
        return (
            <>
                <div key={seasonId + roomId} className="room-info">
                    <div className="room-name">
                        {this.roomsNames.get(roomId)}
                    </div>
                    <div className="rates-container">
                        {data ? data.map(this.renderRate) : null}
                        <div
                            className="add-icon-container"
                            onClick={() => this.setRateStub(stub)}
                        >
                            <span className="icon icon-action-cancel rotate-45-deg" />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    renderSeason = (seasonId) => {
        const { t } = this.props;
        const roomIds = Array.from(this.roomsNames.keys());
        const seasonBranch = this.ratesTree.get(seasonId);
        const isExpanded = seasonBranch.isExpanded;
        const seasonData = seasonBranch.data;
        const arrowClassName = isExpanded ?
            'icon icon-arrow-expand-rotate' :
            'icon icon-arrow-expand';
        let numberOfRates = 0;
        Array.from(seasonData.entries()).forEach(([, roomsArray]) => {
            numberOfRates += roomsArray.length;
        });

        return (
            <div className="season-container">
                <div
                    key={seasonId}
                    className={'season-header' + __class(isExpanded, 'expanded')}
                    onClick={() => this.onSeasonClick(seasonId)}
                >
                    <span className={arrowClassName} />
                    <span>{this.seasonsNames.get(seasonId)}</span>
                    <span className="number-of-rates">{__plural(t, numberOfRates, t('rate'))}</span>
                </div>
                {isExpanded ?
                    <div className="season-info">
                        {roomIds.map((id) => this.renderRoom(seasonId, id, seasonData.get(id)))}
                    </div> :
                    null
                }
            </div>
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
                {this.activeRate || this.rateStub ?
                    <RateActionModal
                        rate={this.activeRate}
                        rateStub={this.rateStub}
                        roomsOptions={this.roomsOptions}
                        seasonsOptions={this.seasonsOptions}
                        action={this.activeRate ? this.onRemoveClick : this.onCreateClick}
                        onClose={this.hideModal}
                    /> :
                    null
                }
            </>
        );
    }
}

SeasonsRates.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(SeasonsRates);
