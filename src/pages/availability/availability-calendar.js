import React from 'react';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Link, Redirect } from 'react-router-dom';
import propTypes from 'prop-types';
import { Loader } from 'matsumoto/src/simple';
import Breadcrumbs from 'matsumoto/src/components/breadcrumbs';
import { CachedForm } from 'matsumoto/src/components/form';
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
class AvailabilityCalendar extends React.Component {
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
    get pageTitle() {
        const { t } = this.props;
        return this.roomsList && this.roomId && this.roomsList.has(this.roomId) ?
            t('Availability Calendar') + ` - ${this.roomsList.get(this.roomId)}` :
            t('Availability Calendar - Choose a Room');
    }

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
            getContractAccommodations(requestParams)
        ]).then(this.getDataSuccess);

        if (this.roomId) {
            this.getAvailabilityRestrictions().then(this.setAvailabilityRestrictions);
        }
    }

    componentDidUpdate(prevProps) {
        const roomId = this.props.match.params.roomId;
        this.setRoomId(roomId);
        const isRoomIdChanged = prevProps.match.params.roomId !== roomId;
        if (isRoomIdChanged) {
            if (roomId) {
                this.getAvailabilityRestrictions().then(this.setAvailabilityRestrictions);
            } else {
                this.setAvailabilityRestrictions(undefined);
            }
        }
    }

    @action
    getDataSuccess = ([contract, accommodationsList]) => {
        this.roomsList = new Map();
        this.contract = contract;
        accommodationsList.forEach((accommodation) => {
            accommodation.roomIds?.forEach((roomId) => {
                this.roomsList.set(String(roomId), `#${roomId}: ${accommodation.name[UI.editorLanguage]}`);
            });
        });
    }

    getAvailabilityRestrictions = () => {
        return getAvailabilityRestrictions({
            urlParams: {
                contractId: this.contractId,
                roomId: this.roomId
            }
        });
    }

    @action
    setAvailabilityRestrictions = (restrictions) => {
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
        this.setRoomId(undefined);
        // this.redirectUrl = `/contract/${this.contractId}`;
    }

    @action
    setRoomId = (roomId) => {
        this.roomId = roomId;
    }

    renderBreadcrumbs = () => {
        const { t } = this.props;
        const commonBreadCrumbs = [
            {
                text: t('Contracts'),
                link: '/contracts'
            },
            {
                text: this.contract.name || `Contract #${this.contractId}`,
                link: `/contract/${this.contractId}`
            }
        ];
        const backLink = this.roomId ?
            `/contract/${this.contractId}/availability/rooms` :
            `/contract/${this.contractId}`;
        return (
            <Breadcrumbs
                backLink={backLink}
                items={[
                    ...commonBreadCrumbs,
                    ...this.roomId ?
                        [
                            {
                                text: t('Rooms'),
                                link: `/contract/${this.contractId}/availability/rooms`
                            }
                        ] :
                        [],
                    {
                        text: this.pageTitle
                    }
                ]}
            />
        );
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

    renderRoomsList = () => {
        return Array.from(this.roomsList.entries()).map(([roomId, roomName]) => {
            return (
                <div key={roomId} className="room-link-container">
                    <Link
                        to={`/contract/${this.contractId}/availability/room/${roomId}/calendar`}
                        className="button transparent-with-border"
                    >
                        <span className="room-link">{roomName}</span>
                    </Link>
                </div>
            );
        });
    }

    render() {
        if (this.contract === undefined) {
            return <Loader />;
        }
        if (this.redirectUrl) {
            return <Redirect push to={this.redirectUrl} />;
        }
        return (
            <>
                <div className="settings block">
                    <section>
                        {this.renderBreadcrumbs()}
                        <h2>
                            <span className="brand">
                                {this.pageTitle}
                            </span>
                        </h2>
                        {this.roomId ?
                            this.renderCalendar() :
                            this.renderRoomsList()
                        }
                    </section>
                </div>
            </>
        );
    }
}

AvailabilityCalendar.propTypes = {
    t: propTypes.func,
    match: propTypes.object
};

export default withTranslation()(AvailabilityCalendar);
