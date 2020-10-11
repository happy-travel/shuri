import React from 'react';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import propTypes from 'prop-types';
import { Loader } from 'matsumoto/src/simple';
import { CachedForm } from 'matsumoto/src/components/form';
import Menu from 'parts/menu';
import CalendarForm from 'components/calendar';
import {
    getAvailabilityRestrictions,
    getContract,
    getContractAccommodations,
    updateAvailabilityRestrictions
} from 'providers/api';
import UI from 'stores/shuri-ui-store';
import { convertRestrictionsToForm, convertFormToRestrictions } from 'pages/calendar/utils/converter';

@observer
class RoomAvailabilityCalendar extends React.Component {
    @observable redirectUrl;
    @observable roomsList;
    @observable contract;
    @observable availabilityRestrictions;
    @observable roomId = this.props.match.params.roomId;
    contractId = this.props.match.params.contractId;
    possibleCalendarValues = {
        StopSale: this.props.t('Stop sale'),
        Allotment: this.props.t('Allotment'),
        FramedFreeSale: this.props.t('Framed free sale'),
        FreeSale: this.props.t('Free sale')
    };

    @computed
    get initialCalendarValues() {
        if (!this.availabilityRestrictions || !this.contract) {
            return undefined;
        }
        return convertRestrictionsToForm(this.availabilityRestrictions, this.contract);
    }

    constructor(props) {
        super(props);
        const requestParams = { urlParams: { id: this.contractId } };
        Promise.all([
            getContract(requestParams),
            getContractAccommodations(requestParams),
            getAvailabilityRestrictions({
                urlParams: {
                    contractId: this.contractId,
                    roomId: this.roomId
                }
            })
        ]).then(this.getDataSuccess);
    }

    @action
    getDataSuccess = ([contract, accommodationsList, restrictions]) => {
        this.roomsList = new Map();
        this.contract = contract;
        accommodationsList.forEach((accommodation) => {
            accommodation.roomIds?.forEach((roomId) => {
                this.roomsList.set(String(roomId), `#${roomId}: ${accommodation.name[UI.editorLanguage]}`);
            });
        });
        this.availabilityRestrictions = restrictions;
    }

    onSubmit = (values) => {
        updateAvailabilityRestrictions({
            urlParams: {
                id: this.contractId
            },
            body: convertFormToRestrictions(values, this.contract, Number(this.roomId))
        }).then(this.updateAvailabilityRestrictionsSuccess);
    }

    @action
    updateAvailabilityRestrictionsSuccess = () => {
        this.redirectUrl = `/contract/${this.contractId}/availability/rooms`;
    }

    renderCalendar = () => {
        if (this.initialCalendarValues === undefined) {
            return <Loader />;
        }

        return (
            <div className="calendar-table availability-calendar">
                <CachedForm
                    initialValues={this.initialCalendarValues}
                    onSubmit={this.onSubmit}
                    render={(formik) => {
                        return (
                            <div className="form">
                                <CalendarForm
                                    formik={formik}
                                    possibleValues={this.possibleCalendarValues}
                                    startDate={this.contract.validFrom}
                                    endDate={this.contract.validTo}
                                />
                            </div>
                        );
                    }}
                    enableReinitialize
                />
            </div>
        );
    }

    render() {
        const isLoading = this.contract === undefined;
        if (this.redirectUrl) {
            return <Redirect push to={this.redirectUrl} />;
        }
        return (
            <>
                <div className="settings block">
                    <Menu match={this.props.match}/>
                    <section>
                        {isLoading ?
                            <Loader /> :
                            <>
                                <h2>
                                    <span className="brand">
                                        {this.props.t('Availability Calendar') +
                                        ` - ${this.roomsList.get(this.roomId)}`
                                        }
                                    </span>
                                </h2>
                                {this.renderCalendar()}
                            </>
                        }
                    </section>
                </div>
            </>
        );
    }
}

RoomAvailabilityCalendar.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(RoomAvailabilityCalendar);
