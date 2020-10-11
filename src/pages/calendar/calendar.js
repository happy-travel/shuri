import React from 'react';
import { action, observable } from 'mobx';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import propTypes from 'prop-types';
import { CachedForm } from 'matsumoto/src/components/form';
import { Loader } from 'matsumoto/src/simple';
import Menu from 'parts/menu';
import CalendarForm from 'components/calendar';
import SeasonsList from '../seasons/seasons-list';
import {
    convertRangesToForm,
    convertFormToRanges,
    formatSeasons
} from './utils/converter';
import {
    getContract,
    getSeasonRanges,
    updateSeasonRanges
} from 'providers/api';
import SeasonsStore from 'stores/shuri-seasons-store';

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
            getSeasonRanges(requestParams)
        ]).then(this.getDataSuccess);

        SeasonsStore.loadSeasons(requestParams);
    }

    @action
    getDataSuccess = ([contract, ranges]) => {
        this.contract = contract;
        this.initialValues = convertRangesToForm(ranges, contract);
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

    renderContent = () => {
        if (this.redirectUrl) {
            return <Redirect push to={this.redirectUrl} />;
        }

        return (<div className="calendar-table">
            <div className="hide">{JSON.stringify(SeasonsStore.seasons)}</div>
            <CachedForm
                initialValues={this.initialValues}
                onSubmit={this.onSubmit}
                render={(formik) => {
                    return (
                        <div className="form">
                            <CalendarForm
                                formik={formik}
                                possibleValues={formatSeasons(SeasonsStore.seasons)}
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
        const isLoading = this.contract === undefined;
        return (
            <>
                <div className="settings block">
                    <Menu match={this.props.match} />
                    <section>
                        {isLoading ?
                            <Loader /> :
                            <>
                                <SeasonsList
                                    contractId={this.contractId}
                                />
                                <h2>
                                    <span className="brand">
                                        {`Calendar — ${this.contract.name}`}
                                    </span>
                                </h2>
                                {this.renderContent()}
                            </>
                        }

                    </section>
                </div>
            </>
        );
    }
}

Calendar.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(Calendar);
