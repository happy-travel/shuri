import React from 'react';
import { withTranslation } from 'react-i18next';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import { Loader } from 'matsumoto/src/simple';
import Menu from 'parts/menu';
import CancellationActionModal from 'pages/cancellations/cancellation-action-modal';
import UI from 'stores/shuri-ui-store';
import EntitiesStore from 'stores/shuri-entities-store';
import { getEntitiesTree } from 'utils/ui-utils';
import {
    getContract,
    getContractAccommodations,
    getCancellations,
    getSeasons,
    createCancellation,
    removeCancellation
} from 'providers/api';

@observer
class Cancellations extends React.Component {
    contractId = this.props.match.params.id;
    @observable contract;
    @observable seasonsList;
    @observable accommodationsList;
    @observable cancellationsList;
    @observable cancellationsTree;
    @observable cancellationStub;
    @observable activeCancellationPolicy;
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
            getCancellations(requestParams),
            getSeasons(requestParams),
            getContractAccommodations(requestParams)
        ]).then(this.getDataSuccess);
    }

    @action
    getDataSuccess = ([contract, cancellationsList, seasonsList, accommodationsList]) => {
        this.contract = contract;
        this.seasonsList = seasonsList;
        this.accommodationsList = accommodationsList;
        this.cancellationsList = cancellationsList;
        this.cancellationsTree = getEntitiesTree(this.cancellationsList, this.seasonsList);
        EntitiesStore.setContract(contract);
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
    setCancellationStub = (stub) => {
        this.cancellationStub = stub;
    }

    @action
    setActiveCancellationPolicy = (cancellation, index) => {
        this.activeCancellationPolicy = { cancellation, index };
    }

    @action
    hideModal = () => {
        this.activeCancellationPolicy = undefined;
        this.cancellationStub = undefined;
    }

    @action
    onSeasonClick = (seasonId) => {
        const isExpanded = this.cancellationsTree.get(seasonId).isExpanded;
        this.cancellationsTree.get(seasonId).isExpanded = !isExpanded;
    }

    onRemoveClick = () => {
        if (this.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        removeCancellation({
            urlParams: { id: this.contractId },
            body: [this.activeCancellationPolicy.cancellation.id]
        }).then(this.onRemoveClickSuccess).finally(this.onRemoveClickFinally);
    }

    @action
    onRemoveClickSuccess = () => {
        const { cancellation: { seasonId, roomId, id } } = this.activeCancellationPolicy;
        this.cancellationsList = this.cancellationsList.filter((cancellation) => cancellation.id !== id);
        const branch = this.cancellationsTree.get(seasonId).data.get(roomId);
        const newBranch = branch.filter((rate) => rate.id !== id)
        this.cancellationsTree.get(seasonId).data.set(roomId, newBranch);
        if (newBranch.length === 0) {
            this.cancellationsTree.get(seasonId).data.delete(roomId);
        }
    }

    onRemoveClickFinally = () => {
        this.hideModal();
        this.unsetRequestingApiStatus();
    }

    @action
    onCreateClick = (values) => {
        if (this.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus()
        createCancellation({
            urlParams: {
                id: this.contractId
            },
            body: [reformatValues(values)]
        }).then(this.onCreateClickSuccess).finally(this.onCreateClickFinally);
    }

    onCreateClickSuccess = ([cancellation]) => {
        const { seasonId, roomId } = cancellation;
        this.cancellationsList.push(cancellation);
        const branch = this.cancellationsTree.get(seasonId);
        if (!branch) {
            this.cancellationsTree.set(
                seasonId,
                {
                    isExpanded: true,
                    data: new Map([[roomId, [cancellation]]])
                }
            );
        } else {
            branch.isExpanded = true;
            if (branch.data.has(roomId)) {
                branch.data.get(roomId).push(cancellation);
            } else {
                branch.data.set(roomId, [cancellation]);
            }
        }
        this.hideModal();
    }

    onCreateClickFinally = () => {
        this.hideModal();
        this.unsetRequestingApiStatus();
    }

    renderCancellation = (cancellation) => {
        const { t } = this.props;
        return cancellation.policies.map((policy, index) => (
            <div
                key={cancellation.id}
                className="rate-info"
                onClick={() => this.setActiveCancellationPolicy(cancellation, index)}
            >
                <div>
                    {t(policy.penaltyType)}
                    <span className="bullet" />
                    {t('Penalty charge') + `: ${policy.penaltyCharge}`}
                </div>
                <div>
                    {
                        t('From day') +
                        ` ${policy.daysPriorToArrival.fromDay} ` +
                        t('to day') +
                        ` ${policy.daysPriorToArrival.toDay}`
                    }
                </div>
            </div>
        ));
    }

    renderRoomPolicies = (seasonId, roomId, data) => {
        return (
            <>
                <div key={seasonId + roomId} className="room-info">
                    <div className="room-name">
                        {this.roomsNames.get(roomId)}
                    </div>
                    <div className="rates-container">
                        {data ? data.map(this.renderCancellation) : null}
                        <div
                            className="add-icon-container"
                            onClick={() => this.setCancellationStub({ seasonId, roomId })}
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
        const seasonBranch = this.cancellationsTree.get(seasonId);
        const isExpanded = seasonBranch.isExpanded;
        const seasonData = seasonBranch.data;
        const arrowClassName = isExpanded ?
            'icon icon-arrow-expand-rotate' :
            'icon icon-arrow-expand';
        let numberOfCancellations = 0;
        Array.from(seasonData.entries()).forEach(([, roomsArray]) => {
            numberOfCancellations += roomsArray.length;
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
                    <span className="number-of-rates">{__plural(t, numberOfCancellations, t('policy'))}</span>
                </div>
                {isExpanded ?
                    <div className="season-info">
                        {roomIds.map((id) => this.renderRoomPolicies(seasonId, id, seasonData.get(id)))}
                    </div> :
                    null
                }
            </div>
        );
    }

    renderSeasons = () => {
        const { t } = this.props;
        if (this.cancellationsTree === undefined) {
            return <Loader />;
        }

        if (this.cancellationsTree.size === 0) {
            return <div>{t('No cancellations')}</div>;
        }

        if (this.roomsNames.size === 0) {
            return <div>{t('No rooms added')}</div>;
        }

        return (
            Array.from(this.cancellationsTree.keys()).map(this.renderSeason)
        );
    }

    render() {
        const isLoading = this.contract === undefined;

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
                                        {this.props.t('Cancellation Policies')}
                                    </span>
                                </h2>
                                {this.renderSeasons()}
                            </>
                        }
                    </section>
                </div>
                {this.activeCancellationPolicy || this.cancellationStub ?
                    <CancellationActionModal
                        cancellation={this.activeCancellationPolicy?.cancellation}
                        policyIndex={this.activeCancellationPolicy?.index}
                        cancellationStub={this.cancellationStub}
                        roomsOptions={this.roomsOptions}
                        seasonsOptions={this.seasonsOptions}
                        onClose={this.hideModal}
                        action={this.activeCancellationPolicy ? this.onRemoveClick : this.onCreateClick}
                    /> :
                    null
                }
            </>
        );
    }
}

function reformatValues(values) {
    const { roomId, seasonId } = values;
    delete values.roomId;
    delete values.seasonId;
    return {
        roomId,
        seasonId,
        policies: [values]
    };
}

Cancellations.propTypes = {
    t: propTypes.func,
    match: propTypes.object
}

export default withTranslation()(Cancellations);
