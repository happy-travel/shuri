import React from 'react';
import { withTranslation } from 'react-i18next';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import { Loader } from 'matsumoto/src/simple';
import {
    createSeason,
    removeSeason,
    getContract
} from 'providers/api';
import SeasonCreateModal from 'pages/seasons/season-create-modal';
import DialogModal from 'parts/dialog-modal';
import Modal from 'parts/modal';
import SeasonsStore from 'stores/shuri-seasons-store';

@observer
class SeasonsList extends React.Component {
    @observable contract;
    @observable isCreateModalShown = false;
    @observable isListModalShown = false;
    @observable removingSeason;
    @observable isRequestingApi = false;
    contractId = this.props.contractId;

    componentDidMount() {
        const requestParams = {
            urlParams: {
                id: this.contractId
            }
        };
        Promise.all([
            getContract(requestParams)
        ]).then(this.getDataSuccess);

        SeasonsStore.loadSeasons(requestParams);
    }

    @action
    getDataSuccess = ([contract]) => {
        this.contract = contract;
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
    onOpenListModal = () => {
        this.isListModalShown = true;
    }

    @action
    onOpenCreateModal = () => {
        this.isCreateModalShown = true;
    }

    @action
    onCloseListModal = () => {
        this.isListModalShown = false;
    }

    @action
    onCloseCreateModal = () => {
        this.isCreateModalShown = false;
    }

    @action
    setRemovingSeason = (season) => {
        this.removingSeason = season;
    }

    @action
    unsetRemovingSeason = () => {
        this.removingSeason = undefined;
    }

    onCreateClick = (values) => {
        this.setRequestingApiStatus();
        createSeason({
            urlParams: {
                id: this.contractId
            },
            body: [values.seasonName]
        }).then(this.loadSeasons).finally(this.createSeasonFinally);
    }

    loadSeasons = () => {
        const requestParams = {
            urlParams: {
                id: this.contractId
            }
        };
        SeasonsStore.loadSeasons(requestParams)
    }

    createSeasonFinally = () => {
        this.onCloseCreateModal();
        this.unsetRequestingApiStatus();
    }

    onRemoveClick = () => {
        this.setRequestingApiStatus();
        removeSeason({
            urlParams: {
                contractId: this.contractId,
                id: this.removingSeason.id
            }
        }).then(this.loadSeasons).finally(this.removeSeasonFinally);
    }

    removeSeasonFinally = () => {
        this.unsetRemovingSeason();
        this.unsetRequestingApiStatus();
    }

    renderContent = () => {
        if (SeasonsStore.seasons === undefined) {
            return <Loader />;
        }

        return (
            <div>
                <div className="wrapper">
                    {SeasonsStore.seasons.map((season, index) => (
                        <div key={index}>
                            <span>{season.name}</span>
                            <span
                                onClick={() => this.setRemovingSeason(season)}
                                className="icon icon-action-cancel seasons-remove-icon"
                            />
                        </div>
                    ))}
                </div>
                <button
                    className="button"
                    onClick={this.onOpenCreateModal}
                >
                    {this.props.t('Create season')}
                </button>
            </div>
        );
    }

    render() {
        const { t } = this.props;
        if (this.contract === undefined) {
            return <Loader />;
        }
        return (
            <div className="seasons-list">
                <button
                    className="enter-button button"
                    onClick={this.onOpenListModal}
                >
                    {t('Seasons list')}
                </button>
                { this.isListModalShown &&
                  !this.removingSeason &&
                  !this.isCreateModalShown &&
                    <Modal
                        onCloseClick={this.onCloseListModal}
                        title={t('Seasons list')}
                    >
                        {this.renderContent()}
                    </Modal>
                }
                {this.isCreateModalShown ?
                    <SeasonCreateModal
                        onCloseClick={this.onCloseCreateModal}
                        onCreateClick={!this.isRequestingApi ? this.onCreateClick : undefined}
                    /> :
                    null
                }
                {this.removingSeason ?
                    <DialogModal
                        title={t('Removing season')}
                        text={`Are you sure you want to proceed and remove season '${this.removingSeason.name}'?`}
                        onNoClick={this.unsetRemovingSeason}
                        onYesClick={!this.isRequestingApi ? this.onRemoveClick : undefined}
                    /> :
                    null
                }
            </div>
        );
    }
}

SeasonsList.propTypes = {
    t: propTypes.func,
    contractId: propTypes.string
};

export default withTranslation()(SeasonsList);
