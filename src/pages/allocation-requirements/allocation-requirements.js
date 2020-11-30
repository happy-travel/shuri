import React from 'react';
import { withTranslation } from 'react-i18next';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import { Loader } from 'matsumoto/src/simple';
import Menu from 'parts/menu';
import RequirementActionModal from 'pages/allocation-requirements/requirement-action-modal';
import EntitiesStore from 'stores/shuri-entities-store';
import UI from 'stores/shuri-ui-store';
import {
    getContract,
    getAllocationRequirements,
    removeAllocationRequirement,
    createAllocationRequirement,
    getSeasonRanges,
    getSeasons,
    getContractAccommodations
} from 'providers/api';
import { getEntitiesTree } from 'utils/ui-utils';
import { formatDateToString } from 'utils/date-utils';

@observer
class AllocationRequirements extends React.Component {
    contractId = this.props.match.params.id;
    @observable contract;
    @observable allocationsList;
    @observable seasonsRangesList;
    @observable accommodationsList;
    @observable allocationsTree;
    @observable seasonsNames;
    @observable requirementStub;
    @observable activeRequirement;
    @observable isRequestingApi = false;

    @computed
    get seasonsRangesNames() {
        if (!this.seasonsNames) {
            return undefined;
        }
        return new Map(this.seasonsRangesList.map((range) => {
            const seasonName = this.seasonsNames.get(range.seasonId);
            const startDate = formatDateToString(range.startDate);
            const endDate = formatDateToString(range.endDate);
            return [range.id, `${seasonName} (${startDate} - ${endDate})`]
        }));
    }

    @computed
    get seasonsRangesOptions() {
        return this.seasonsRangesList.map((range) => ({
            value: range.id,
            text: this.seasonsRangesNames.get(range.id)
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
            getAllocationRequirements(requestParams),
            getSeasons(requestParams),
            getSeasonRanges(requestParams),
            getContractAccommodations(requestParams)
        ]).then(this.getDataSuccess);
    }

    @action
    getDataSuccess = ([contract, allocationsList, seasonsList, seasonsRangesList, accommodationsList]) => {
        this.contract = contract;
        this.seasonsNames = new Map(seasonsList.map((season) => [season.id, season.name]));
        this.seasonsRangesList = seasonsRangesList;
        this.accommodationsList = accommodationsList;
        this.allocationsList = allocationsList;
        this.allocationsTree = getEntitiesTree(allocationsList, seasonsRangesList, 'seasonRangeId');
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
    setRequirementStub = (stub) => {
        this.requirementStub = stub;
    }

    @action
    setActiveRequirement = (requirement) => {
        this.activeRequirement = requirement;
    }

    @action
    hideModal = () => {
        this.requirementStub = undefined;
        this.activeRequirement = undefined;
    }

    @action
    onSeasonRangeClick = (id) => {
        this.allocationsTree.get(id).isExpanded = !this.allocationsTree.get(id).isExpanded;
    }

    onRemoveClick = () => {
        if (this.isRequestingApi) {
            return;
        }
        this.setRequestingApiStatus();
        removeAllocationRequirement({
            urlParams: { id: this.contractId },
            body: [this.activeRequirement.id]
        }).then(this.onRemoveClickSuccess).finally(this.onRemoveClickFinally);
    }

    @action
    onRemoveClickSuccess = () => {
        const { seasonRangeId, roomId, id } = this.activeRequirement;
        this.allocationsList = this.allocationsList.filter((cancellation) => cancellation.id !== id);
        const branch = this.allocationsTree.get(seasonRangeId).data.get(roomId);
        const newBranch = branch.filter((requirement) => requirement.id !== id)
        this.allocationsTree.get(seasonRangeId).data.set(roomId, newBranch);
        if (newBranch.length === 0) {
            this.allocationsTree.get(seasonRangeId).data.delete(roomId);
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
        this.setRequestingApiStatus();
        createAllocationRequirement({
            urlParams: {
                id: this.contractId
            },
            body: [reformatValues(values)]
        }).then(this.onCreateClickSuccess).finally(this.onCreateClickFinally);
    }

    onCreateClickSuccess = ([requirement]) => {
        const { seasonRangeId, roomId } = requirement;
        this.allocationsList.push(requirement);
        const branch = this.allocationsTree.get(seasonRangeId);
        if (!branch) {
            this.allocationsTree.set(
                seasonRangeId,
                {
                    isExpanded: true,
                    data: new Map([[roomId, [requirement]]])
                }
            );
        } else {
            branch.isExpanded = true;
            if (branch.data.has(roomId)) {
                branch.data.get(roomId).push(requirement);
            } else {
                branch.data.set(roomId, [requirement]);
            }
        }
        this.hideModal();
    }

    onCreateClickFinally = () => {
        this.hideModal();
        this.unsetRequestingApiStatus();
    }

    renderRequirement = (requirement) => {
        const { t } = this.props;
        const releaseDays = requirement.releaseDays !== undefined ?
            __plural(t, requirement.releaseDays, t('release day')) :
            t('Release days are not defined');
        const allotment = requirement.allotment !== undefined ?
            __plural(t, requirement.allotment, t('allotment')) :
            t('Allotments are not defined');
        const minLengthOfStay = requirement.minimumLengthOfStay !== undefined ?
            t('Minimum length of stay is') + ' ' + __plural(t, requirement.minimumLengthOfStay, t('day')) :
            t('Minimum length of stay is not defined');
        return (
            <div
                key={requirement.id}
                className="rate-info"
                onClick={() => this.setActiveRequirement(requirement)}
            >
                <div>
                    {releaseDays}
                    <span className="bullet" />
                    {allotment}
                </div>
                <div>{minLengthOfStay}</div>
            </div>
        );
    }

    renderRoomRequirements = (seasonRangeId, roomId, data) => {
        return (
            <div key={seasonRangeId + roomId} className="room-info">
                <div className="room-name">
                    {this.roomsNames.get(roomId)}
                </div>
                <div className="rates-container">
                    {data ?
                        data.map(this.renderRequirement) :
                        <div
                            className="add-icon-container"
                            onClick={() => this.setRequirementStub({ seasonRangeId, roomId })}
                        >
                            <span className="icon icon-add" />
                        </div>
                    }
                </div>
            </div>
        )
    }

    renderSeasonRange = (seasonRangeId) => {
        const { t } = this.props;
        const roomIds = Array.from(this.roomsNames.keys());
        const seasonRangeBranch = this.allocationsTree.get(seasonRangeId);
        const isExpanded = seasonRangeBranch.isExpanded;
        const seasonRangeData = seasonRangeBranch.data;
        const arrowClassName = isExpanded ?
            'icon icon-expand-rotate' :
            'icon icon-expand';
        let numberOfAllocationRequirements = 0;
        Array.from(seasonRangeData.entries()).forEach(([, roomsArray]) => {
            numberOfAllocationRequirements += roomsArray.length;
        });

        return (
            <div className="season-container">
                <div
                    key={seasonRangeId}
                    className={'season-header' + __class(isExpanded, 'expanded')}
                    onClick={() => this.onSeasonRangeClick(seasonRangeId)}
                >
                    <span>{this.seasonsRangesNames.get(seasonRangeId)}</span>
                    <span className={arrowClassName} />
                    <span className="number-of-rates">
                        {__plural(t, numberOfAllocationRequirements, t('requirement'))}
                    </span>
                </div>
                {isExpanded ?
                    <div className="season-info">
                        {roomIds.map((id) => this.renderRoomRequirements(seasonRangeId, id, seasonRangeData.get(id)))}
                    </div> :
                    null
                }
            </div>
        );
    }

    renderSeasonsRanges = () => {
        const { t } = this.props;
        if (this.allocationsTree === undefined) {
            return <Loader />;
        }

        if (this.allocationsTree.size === 0) {
            return <div>{t('No allocation requirements')}</div>;
        }

        if (this.roomsNames.size === 0) {
            return <div>{t('No rooms added')}</div>;
        }

        return Array.from(this.allocationsTree.keys()).map(this.renderSeasonRange);
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
                                        {this.props.t('Allocation Requirements')}
                                    </span>
                                </h2>
                                {this.renderSeasonsRanges()}
                            </>
                        }
                    </section>
                </div>
                {this.activeRequirement || this.requirementStub ?
                    <RequirementActionModal
                        requirement={this.activeRequirement}
                        requirementStub={this.requirementStub}
                        roomsOptions={this.roomsOptions}
                        seasonsRangesOptions={this.seasonsRangesOptions}
                        onClose={this.hideModal}
                        action={this.activeRequirement ? this.onRemoveClick : this.onCreateClick}
                    /> :
                    null
                }
            </>
        );
    }
}

function reformatValues(values) {
    ['allotment', 'releaseDays', 'minimumLengthOfStay'].forEach((key) => {
        if (values[key]) {
            values[key] = Number(values[key]);
        }
    })
    return values;
}

AllocationRequirements.propTypes = {
    t: propTypes.func,
    match: propTypes.object
}

export default withTranslation()(AllocationRequirements);
