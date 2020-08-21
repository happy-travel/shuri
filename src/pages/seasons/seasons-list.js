import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import Table from 'matsumoto/src/components/external/table';
import { Loader } from 'matsumoto/src/simple';
import { getSeasons, createSeason, removeSeason } from 'providers/api';
import SeasonCreateModal from 'pages/seasons/season-create-modal';
import DialogModal from '../../parts/dialog-modal';

const PAGE_SIZE = 10;

@observer
class SeasonsList extends React.Component {
    @observable seasonsList;
    @observable tablePageIndex = 0;
    @observable isCreateModalShown = false;
    @observable removingSeason;
    @observable isRequestingApi = false;
    contractId = this.props.match.params.id;
    tableColumns;

    constructor(props) {
        super(props);

        this.tableColumns = [
            {
                Header: this.props.t('Name'),
                accessor: 'name',
                Cell: this.renderIdColumn
            }
        ];
    }

    componentDidMount() {
        this.loadSeasons();
    }

    @action
    loadSeasons = () => {
        this.seasonsList = undefined;
        getSeasons({
            urlParams: {
                id: this.contractId
            }
        }).then(this.getSeasonsSuccess);
    }

    @action
    getSeasonsSuccess = (list) => {
        this.seasonsList = list;
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
    onOpenCreateModal = () => {
        this.isCreateModalShown = true;
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

    @action
    onPaginationClick = ({ pageIndex }) => {
        this.tablePageIndex = pageIndex;
    }

    onCreateClick = (values) => {
        this.setRequestingApiStatus();
        createSeason({
            urlParams: {
                id: this.contractId
            },
            body: [values.seasonName]
        }).then(this.createSeasonSuccess).finally(this.createSeasonFinally);
    }

    createSeasonSuccess = () => {
        this.onCloseCreateModal();
        this.loadSeasons();
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
        }).then(this.removeSeasonSuccess).finally(this.removeSeasonFinally);
    }

    removeSeasonSuccess = () => {
        this.unsetRemovingSeason();
        this.loadSeasons();
    }

    removeSeasonFinally = () => {
        this.unsetRemovingSeason();
        this.unsetRequestingApiStatus();
    }

    renderIdColumn = (item) => {
        const season = this.seasonsList[item.row.id];
        return (
            <div
                className="seasons-table-row"
                onClick={() => this.setRemovingSeason(season)}
            >
                <span>{season.name}</span>
                <span className="icon icon-action-cancel seasons-remove-icon" />
            </div>
        );
    }

    renderBreadcrumbs = () => {
        const { t } = this.props;
        return (
            <Breadcrumbs
                backLink={`/contract/${this.contractId}`}
                items={[
                    {
                        text: t('Contracts list'),
                        link: '/contracts'
                    },
                    {
                        text: `Contract #${this.contractId}`,
                        link: `/contract/${this.contractId}`
                    },
                    {
                        text: t('Seasons')
                    }
                ]}
            />
        );
    }

    renderHeader = () => {
        return (
            <h2>
                <div className="add-new-button-holder">
                    <button
                        className="button small"
                        onClick={this.onOpenCreateModal}
                    >
                        {this.props.t('Create season')}
                    </button>
                </div>
                <span className="brand">
                    {`Seasons for contract #${this.contractId}`}
                </span>
            </h2>
        );
    }

    renderContent = () => {
        if (this.seasonsList === undefined) {
            return <Loader />;
        }
        const tableData = this.seasonsList.slice(
            PAGE_SIZE * this.tablePageIndex,
            PAGE_SIZE * (this.tablePageIndex + 1)
        );

        return this.seasonsList.length ?
            <Table
                data={tableData}
                count={this.seasonsList.length}
                fetchData={this.onPaginationClick}
                columns={this.tableColumns}
                pageIndex={this.tablePageIndex}
                pageSize={PAGE_SIZE}
                manualPagination
            /> :
            this.props.t('No results');
    }

    render() {
        const { t } = this.props;
        return (
            <>
                <div className="settings block">
                    <section>
                        {this.renderBreadcrumbs()}
                        {this.renderHeader()}
                        {this.renderContent()}
                        <div className="row seasons-calendar-link">
                            <Link to={`/contract/${this.contractId}/calendar`}>
                                <button className="button wide">
                                    {t('Go to calendar')}
                                </button>
                            </Link>
                        </div>
                    </section>
                </div>
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
            </>
        );
    }
}

SeasonsList.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(SeasonsList);
