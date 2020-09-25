import React from 'react';
import { action, observable } from 'mobx';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import { CachedForm } from 'matsumoto/src/components/form';
import { Loader } from 'matsumoto/src/simple';
import CalendarForm from 'components/calendar';
import {
    convertRangesToForm,
    convertFormToRanges,
    formatSeasons
} from './utils/converter';
import {
    getContract,
    getSeasonRanges,
    getSeasons,
    updateSeasonRanges
} from 'providers/api';

@observer
class Calendar extends React.Component {
    @observable contract;
    @observable seasons;
    @observable initialValues;
    @observable redirectUrl;
    contractId = this.props.match.params.id;

    componentDidMount() {
        const requestParams = {
            urlParams: {
                id: this.contractId
            }
        };
        Promise.all([
            getContract(requestParams),
            getSeasons(requestParams),
            getSeasonRanges(requestParams)
        ]).then(this.getDataSuccess);
    }

    @action
    getDataSuccess = ([contract, seasonsList, ranges]) => {
        this.contract = contract;
        this.initialValues = convertRangesToForm(ranges, contract);
        this.seasons = formatSeasons(seasonsList);
    }

    onSubmit = (values) => {
        updateSeasonRanges({
            urlParams: {
                id: this.contractId
            },
            body: convertFormToRanges(values, this.contract)
        }).then(this.setRedirectUrl);
    }

    @action
    setRedirectUrl = () => {
        this.redirectUrl = `/contract/${this.contractId}`;
    }

    renderBreadcrumbs = () => {
        const { t } = this.props;
        return (
            <Breadcrumbs
                backLink={`/contract/${this.contractId}/seasons`}
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
                        text: t('Calendar')
                    }
                ]}
            />
        );
    }

    renderContent = () => {
        if (this.redirectUrl) {
            return <Redirect push to={this.redirectUrl} />;
        }

        return (<div className="calendar-table">
            <CachedForm
                initialValues={this.initialValues}
                onSubmit={this.onSubmit}
                render={(formik) => {
                    return (
                        <div className="form">
                            <CalendarForm
                                formik={formik}
                                possibleValues={this.seasons}
                                startDate={this.contract.validFrom}
                                endDate={this.contract.validTo}
                            />
                        </div>
                    );
                }}
                enableReinitialize
            />
        </div>);
    }

    render() {
        if (this.contract === undefined) {
            return <Loader />;
        }
        return (
            <div className="settings block">
                <section>
                    {this.renderBreadcrumbs()}
                    <h2>
                        <span className="brand">
                            {`Calendar — ${this.contract.name}`}
                        </span>
                    </h2>
                    {this.renderContent()}
                </section>
            </div>
        );
    }
}

Calendar.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(Calendar);
